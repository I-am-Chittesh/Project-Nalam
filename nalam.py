import os
import time
import json
import pygame
import speech_recognition as sr  # Using this for robust recording
import google.generativeai as genai
from sqlalchemy import create_engine, text
from gtts import gTTS

# ==============================================================================
# SECTION 1: CONFIGURATION
# ==============================================================================

# 1. API Key
os.environ["GEMINI_API_KEY"] = "AIzaSyCPbprUsUKuQmTHIYr7palqMCZvbTtsGhc"

# 2. Database Connection
DB_URL = "postgresql://postgres:admin_nalam@db.apmogbrgeasetudeumdx.supabase.co:5432/postgres"
engine = create_engine(DB_URL)

# ==============================================================================
# SECTION 2: ROBUST AUDIO HANDLER
# ==============================================================================

class AudioSystem:
    def __init__(self):
        pygame.mixer.init()
        # We use SpeechRecognition just to Capture Audio (not to transcribe)
        self.recognizer = sr.Recognizer()
        # Noise filtering: disable dynamic threshold and set a higher energy threshold
        try:
            self.recognizer.dynamic_energy_threshold = False
            self.recognizer.energy_threshold = 3000
        except Exception:
            pass
        # Detect available microphones and pick a sensible default
        try:
            mic_list = sr.Microphone.list_microphone_names()
            print("Available microphones:", mic_list)
            if not mic_list:
                raise OSError("No microphones found on this system.")

            # Prefer a device whose name contains 'microphone' or 'mic', else use index 0
            device_index = None
            for i, name in enumerate(mic_list):
                lname = name.lower()
                if 'microphone' in lname or 'mic' in lname:
                    device_index = i
                    break
            if device_index is None:
                device_index = 0

            self.mic_device_index = device_index
            self.mic_name = mic_list[device_index]
            self.mic = sr.Microphone(device_index=device_index)
            print(f"Using microphone [{device_index}]: {self.mic_name}")
        except Exception as e:
            print(f"Microphone init error: {e}")
            self.mic = None
            self.mic_device_index = None
            self.mic_name = None
        # Track the last detected language code from the user ('en','hi','ta')
        self.last_language = None

    def record_audio_file(self, timeout=7, phrase_time_limit=20):
        """
        Records audio using SpeechRecognition's silence detection.
        Parameters:
          - timeout: max seconds to wait for phrase to start
          - phrase_time_limit: max seconds for phrase length
        Returns path to a temporary .wav file, or None on timeout/error.
        """
        print("\n🎤 Listening... (Speak in English, Tamil, or Hindi)")

        if self.mic is None:
            print("❌ No working microphone available. Check drivers/permissions.")
            return None

        try:
            with sr.Microphone(device_index=self.mic_device_index) as source:
                try:
                    self.recognizer.adjust_for_ambient_noise(source, duration=1)
                except Exception:
                    pass

                try:
                    audio_data = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)
                    print("⏳ Processing Audio...")
                    filename = "user_input.wav"
                    with open(filename, "wb") as f:
                        f.write(audio_data.get_wav_data())
                    return filename

                except sr.WaitTimeoutError:
                    # Silence timeout
                    return None
                except Exception as e:
                    print(f"❌ Error during recording: {e}")
                    return None

        except OSError as e:
            print(f"❌ OS error accessing the microphone: {e}")
            return None
        except Exception as e:
            print(f"❌ Unexpected microphone error: {e}")
            return None

    def speak_warning(self, lang_code=None):
        """Speak the 5-second termination warning in the given language; if lang_code is None, speak in all three."""
        messages = {
            'en': "AI mode will be terminated in 5 seconds as no input was given.",
            'hi': "किसी इनपुट के न मिलने के कारण AI मोड 5 सेकंड में समाप्त कर दिया जाएगा।",
            'ta': "உள்ளீடு கிடைக்காமல் இருப்பதால் AI முறை 5 விநாடிகளில் முடிவடைய உள்ளது."
        }

        if lang_code in messages:
            self.speak(messages[lang_code], lang_code=lang_code)
        else:
            # speak all three to be safe
            for code in ['en', 'hi', 'ta']:
                self.speak(messages[code], lang_code=code)

    def speak(self, text, lang_code="en"):
        """Plays audio in the detected language."""
        print(f"🤖 AI Replying ({lang_code}): {text}")
        try:
            tts = gTTS(text=text, lang=lang_code, slow=False)
            filename = "ai_response.mp3"
            tts.save(filename)
            
            pygame.mixer.music.load(filename)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
            
            pygame.mixer.music.unload()
            os.remove(filename)
        except Exception as e:
            print(f"❌ TTS Error: {e}")

# ==============================================================================
# SECTION 3: DATABASE TOOLS (Unchanged)
# ==============================================================================

def get_user_context():
    """Fetch user profile from 'app_main'."""
    print("   🔧 [DB Tool] Fetching user profile...") 
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM app_main LIMIT 1")).mappings().fetchone()
        if not result: return "No user logged in."
        available_docs = [k for k, v in result.items() if v is not None and k not in ['name', 'uniqueid']]
        return {"name": result['name'], "uniqueid": result['uniqueid'], "documents": available_docs}

def check_scheme_eligibility(scheme_name: str):
    print(f"   🔧 [DB Tool] Checking scheme: {scheme_name}")
    user_data = get_user_context()
    if isinstance(user_data, str): return user_data
    with engine.connect() as conn:
        scheme = conn.execute(text("SELECT * FROM schemes WHERE name ILIKE :s"), {"s": f"%{scheme_name}%"}).mappings().fetchone()
        if not scheme: return "Scheme not found."
        missing = set(scheme['required_docs']) - set(user_data['documents'])
        return f"Eligible." if not missing else f"Missing docs: {', '.join(missing)}"

def book_appointment_slot(reason: str):
    print(f"   🔧 [DB Tool] Booking slot for: {reason}")
    user_data = get_user_context()
    if isinstance(user_data, str): return user_data
    with engine.connect() as conn:
        conn.execute(text("INSERT INTO appointments (user_uniqueid, service_requested, token_number, slot_time) VALUES (:u, :r, 101, NOW())"), 
                     {"u": user_data['uniqueid'], "r": reason})
        conn.commit()
    return "Token 101 Booked."

def fetch_certificates(certificate_type: str = None):
    """Fetch government certificates for the current user.
    Tries a few common table names and returns rows as a list of dicts or a message.
    """
    print(f"   🔧 [DB Tool] Fetching certificates (type={certificate_type})")
    user_data = get_user_context()
    if isinstance(user_data, str):
        return user_data

    table_candidates = ['certificates', 'government_certificates', 'user_certificates']
    with engine.connect() as conn:
        for table in table_candidates:
            try:
                if certificate_type:
                    q = f"SELECT * FROM {table} WHERE user_uniqueid = :u AND type ILIKE :t LIMIT 10"
                    rows = conn.execute(text(q), {"u": user_data['uniqueid'], "t": f"%{certificate_type}%"}).mappings().fetchall()
                else:
                    q = f"SELECT * FROM {table} WHERE user_uniqueid = :u LIMIT 10"
                    rows = conn.execute(text(q), {"u": user_data['uniqueid']}).mappings().fetchall()

                if rows:
                    return [dict(r) for r in rows]
            except Exception:
                # table may not exist or query failed, try next
                continue

    return "No certificates found for this user."

def transcribe_audio_file(file_path: str, lang: str = 'en-IN'):
    """Transcribes a WAV file using SpeechRecognition + Google Web Speech API.
    Returns the transcribed text or None.
    """
    r = sr.Recognizer()
    try:
        with sr.AudioFile(file_path) as source:
            audio = r.record(source)
        try:
            text = r.recognize_google(audio, language=lang)
            print(f"📝 Transcription: {text}")
            return text
        except sr.UnknownValueError:
            print("❌ Could not understand audio for transcription.")
            return None
        except Exception as e:
            print(f"❌ Transcription error: {e}")
            return None
    except Exception as e:
        print(f"❌ Error reading audio file for transcription: {e}")
        return None

# ==============================================================================
# SECTION 4: MULTIMODAL BRAIN
# ==============================================================================

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Tools available for explicit calls from Python (only invoked when the decision step asks for them)
tools = {
        "get_user_context": get_user_context,
        "check_scheme_eligibility": check_scheme_eligibility,
        "book_appointment_slot": book_appointment_slot,
        "fetch_certificates": fetch_certificates,
}

# Decision model: lightweight, no DB access, decides whether DB tools are needed.
decision_system = """
You are a concise assistant that reads a short transcript of a user's speech and decides
whether calling a backend database or tool is required to fulfill the user's request.

Return EXACTLY one JSON object (no extra text) with these fields:
    - use_db: true or false
    - requested_tool: string name of the tool to call (one of get_user_context, check_scheme_eligibility, book_appointment_slot, fetch_certificates) or null
    - tool_args: object with arguments for the tool (or {} if none)
    - language_code: 'en', 'hi' or 'ta'

Make a conservative decision: only set use_db=true when the user clearly requests data, bookings, eligibility checks or fetching certificates. If the user is chit-chatting, asking for help, greetings, clarifications, or general information, set use_db=false.
Keep responses protective of user privacy: never request or invent user identifiers.
"""

decision_model = genai.GenerativeModel(
    model_name='gemini-3-flash-preview',
    tools=[],
    system_instruction=decision_system,
)
decision_chat = decision_model.start_chat()

# Response model: crafts a friendly, empathetic reply using any tool output you provide.
response_system = """
You are Nalam, a friendly multilingual kiosk assistant. Be warm, approachable and concise.
When given the user's transcription and optionally a 'tool_result' (database output), produce a JSON object:
    {"response_text": "...", "language_code": "en|hi|ta"}
Reply in the same language as 'language_code'. Keep phrasing simple and helpful for all users.
"""

response_model = genai.GenerativeModel(
    model_name='gemini-3-flash-preview',
    tools=[],
    system_instruction=response_system,
)
response_chat = response_model.start_chat()


def send_with_model_fallback(chat_obj, system_instruction, prompt, primary_model='gemini-3-flash-preview', fallback_model='gemini-2-flash', tools_list=None):
    """Send a prompt using the provided chat object; on 429/rate-limit, retry once with fallback model."""
    try:
        return chat_obj.send_message(prompt)
    except Exception as e:
        msg = str(e).lower()
        if '429' in msg or 'rate' in msg or 'rate limit' in msg:
            print(f"⚠️ Rate limit detected ({e}). Switching to fallback model: {fallback_model}")
            try:
                model = genai.GenerativeModel(model_name=fallback_model, tools=(tools_list or []), system_instruction=system_instruction)
                new_chat = model.start_chat()
                return new_chat.send_message(prompt)
            except Exception as e2:
                print(f"⚠️ Fallback model also failed: {e2}")
                raise
        else:
            raise

# ==============================================================================
# SECTION 5: MAIN LOOP
# ==============================================================================

def run_kiosk():
    audio_sys = AudioSystem()
    print("--- Nalam Multilingual Kiosk Started ---")
    
    # --- STANDARD WELCOME MESSAGE (ENGLISH) ---
    audio_sys.speak("Welcome to Nalam Kiosk. How can I help you?", lang_code="en")
    # Track last valid interaction time for auto-exit (seconds)
    last_interaction_time = time.time()
    warning_issued = False
    
    while True:
        try:
            # 1. Record Audio (Robust Way)
                # Two-stage timeout: total 30s, warning at 25s. We'll poll in short chunks so we can issue a warning.
                start_wait = time.time()
                audio_file_path = None
                while time.time() - start_wait < 30 and audio_file_path is None:
                    elapsed = time.time() - last_interaction_time
                    # Issue warning at 25s of inactivity
                    if elapsed >= 25 and not warning_issued:
                        try:
                            audio_sys.speak("Warning: AI mode will terminate in 5 seconds.", lang_code=audio_sys.last_language or 'en')
                        except Exception:
                            pass
                        warning_issued = True

                    # If we've already passed total timeout (safety), break
                    if elapsed >= 30:
                        try:
                            audio_sys.speak("Terminating now", lang_code=audio_sys.last_language or 'en')
                        except Exception:
                            pass
                        print("Auto-terminating due to inactivity.")
                        return

                    # Listen in short chunks (max 3s) so we can check timers
                    chunk = min(3, 30 - (time.time() - start_wait))
                    audio_file_path = audio_sys.record_audio_file(timeout=chunk, phrase_time_limit=chunk)

                if audio_file_path is None:
                    # No audio captured within 30s window -> speak terminating and exit
                    try:
                        audio_sys.speak("Terminating now", lang_code=audio_sys.last_language or 'en')
                    except Exception:
                        pass
                    print("No input received within 30s — terminating.")
                    break

                # We have audio; transcribe first and only treat as a valid command
                # if transcription returns non-empty text. This ignores incidental/noise audio.
                transcription = transcribe_audio_file(audio_file_path) or ""
                if not transcription:
                    print("🔇 Audio detected but no valid speech command — ignoring audio input.")
                    try:
                        os.remove(audio_file_path)
                    except Exception:
                        pass
                    # do not reset last_interaction_time or warning_issued; continue waiting
                    continue

                # Valid user command detected: reset timers and warnings, then proceed
                last_interaction_time = time.time()
                warning_issued = False
                print("🧠 Analyzing Audio...")
                myfile = genai.upload_file(audio_file_path)

                # 3. DECISION STEP: Ask the decision model whether DB access is needed
                decision_prompt = (
                    f"User transcription: {transcription}\n"
                    "Decide whether a database/tool call is needed. Respond with the JSON object described in the system instruction."
                )
                try:
                    dec_res = send_with_model_fallback(decision_chat, decision_system, decision_prompt, tools_list=[])
                    dec_text = dec_res.text.strip()
                    # Clean code block wrappers if present
                    dec_text = dec_text.replace('```json', '').replace('```', '').strip()
                    decision = json.loads(dec_text)
                    # remember user's language preference for future warnings
                    if isinstance(decision, dict) and decision.get('language_code'):
                        audio_sys.last_language = decision.get('language_code')
                except Exception as e:
                    print(f"⚠️ Decision parsing error: {e} -- defaulting to no DB call")
                    decision = {"use_db": False, "requested_tool": None, "tool_args": {}, "language_code": 'en'}

                tool_result = None
                # If the decision says to use DB, call the requested tool exactly once
                if decision.get('use_db'):
                    tool_name = decision.get('requested_tool')
                    tool_args = decision.get('tool_args') or {}
                    func = tools.get(tool_name)
                    if func:
                        try:
                            print(f"   🔧 Invoking tool: {tool_name} with args {tool_args}")
                            tool_result = func(**tool_args) if isinstance(tool_args, dict) else func(tool_args)
                        except Exception as e:
                            tool_result = f"Tool error: {e}"
                    else:
                        tool_result = f"Requested tool '{tool_name}' not available."

                # 4. Ask response model to craft a friendly reply, including any tool_result
                final_prompt = (
                    f"User transcription: {transcription}\n"
                    f"Tool result: {json.dumps(tool_result)}\n"
                    f"Language hint: {decision.get('language_code', 'en')}\n"
                    "Produce exactly one JSON object: {\"response_text\": ..., \"language_code\": ...}."
                )

                try:
                    res = send_with_model_fallback(response_chat, response_system, final_prompt, tools_list=[])
                    clean_text = res.text.replace("```json", "").replace("```", "").strip()
                    data = json.loads(clean_text)
                    # update last language from response if present
                    if isinstance(data, dict) and data.get('language_code'):
                        audio_sys.last_language = data.get('language_code')
                    audio_sys.speak(data.get('response_text', ""), lang_code=data.get('language_code', 'en'))
                except Exception as e:
                    print(f"⚠️ Response generation/parsing error: {e}")
                    # Fallback: speak transcription back in English
                    audio_sys.speak(transcription or "Sorry, I couldn't process that." , lang_code='en')

                # Cleanup
                os.remove(audio_file_path)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    run_kiosk()
