import os
import time
import datetime
import google.generativeai as genai
from sqlalchemy import create_engine, text
from google.generativeai.types import FunctionDeclaration, Tool

# --- AUDIO LIBRARIES ---
import speech_recognition as sr
from gtts import gTTS
import pygame

# ==============================================================================
# SECTION 1: CONFIGURATION
# ==============================================================================

# 1. Google Gemini API Key
os.environ["GEMINI_API_KEY"] = "AIzaSyB0P8rxCtZ4DGGXF4iFLYCacyPbCdXSZgY"

# 2. Database Connection
DB_URL = "postgresql://postgres:admin_nalam@db.apmogbrgeasetudeumdx.supabase.co:5432/postgres"
engine = create_engine(DB_URL, connect_args={'sslmode':'require'})

# 3. Voice Settings
# Use 'en-IN' for Indian English, 'ta-IN' for Tamil
INPUT_LANGUAGE = "en-IN" 
OUTPUT_LANGUAGE = "en" 

# ==============================================================================
# SECTION 2: AUDIO HANDLER (REPLACES BHASHINI)
# ==============================================================================

class AudioHandler:
    def __init__(self):
        # Initialize Microphone
        self.recognizer = sr.Recognizer()
        
        # Initialize Audio Player (Pygame is better than playsound for stability)
        pygame.mixer.init()

    def listen(self):
        """
        Listens to the microphone and converts speech to text.
        """
        print("\n🎤 Listening... (Speak now)")
        try:
            with sr.Microphone() as source:
                # Adjust for ambient noise (e.g., fan noise)
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
                # Listen (stops automatically when silence is detected)
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                
                print("⏳ Transcribing...")
                # Use Google's free speech recognition
                text = self.recognizer.recognize_google(audio, language=INPUT_LANGUAGE)
                print(f"User Said: {text}")
                return text
                
        except sr.WaitTimeoutError:
            print("❌ No speech detected.")
            return None
        except sr.UnknownValueError:
            print("❌ Could not understand audio.")
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

    def speak(self, text):
        """
        Converts text to MP3 and plays it.
        """
        print(f"🤖 AI Saying: {text}")
        try:
            # 1. Generate MP3
            tts = gTTS(text=text, lang=OUTPUT_LANGUAGE, slow=False)
            filename = "response.mp3"
            tts.save(filename)
            
            # 2. Play MP3
            pygame.mixer.music.load(filename)
            pygame.mixer.music.play()
            
            # 3. Wait until audio finishes
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
                
            # 4. Clean up (Optional: delete file)
            pygame.mixer.music.unload()
            os.remove(filename)
            
        except Exception as e:
            print(f"❌ TTS Error: {e}")

# ==============================================================================
# SECTION 3: DATABASE TOOLS (UNCHANGED)
# ==============================================================================

def get_user_context():
    """Fetch user profile from 'app_main'."""
    print("   🔧 [Tool] Fetching user profile...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM app_main LIMIT 1")).mappings().fetchone()
        if not result: return "No user logged in."
        available_docs = [k for k, v in result.items() if v is not None and k not in ['name', 'uniqueid']]
        return {"name": result['name'], "uniqueid": result['uniqueid'], "documents": available_docs}

def check_scheme_eligibility(scheme_name: str):
    """Checks eligibility for a scheme."""
    print(f"   🔧 [Tool] Checking scheme: {scheme_name}")
    user_data = get_user_context()
    if isinstance(user_data, str): return user_data
    
    with engine.connect() as conn:
        scheme = conn.execute(text("SELECT * FROM schemes WHERE name ILIKE :s"), {"s": f"%{scheme_name}%"}).mappings().fetchone()
        if not scheme: return "Scheme not found."

        required_docs = set(scheme['required_docs']) 
        user_docs = set(user_data['documents'])
        missing = required_docs - user_docs
        
        if not missing: return f"Eligible for {scheme['name']}."
        else: return f"Not eligible. Missing: {', '.join(missing)}"

def book_appointment_slot(reason: str):
    """Books an appointment."""
    print(f"   🔧 [Tool] Booking slot for: {reason}")
    user_data = get_user_context()
    if isinstance(user_data, str): return user_data

    with engine.connect() as conn:
        slot_time = datetime.datetime.now() + datetime.timedelta(hours=1)
        token = datetime.datetime.now().second + 100
        conn.execute(text("INSERT INTO appointments (user_uniqueid, service_requested, token_number, slot_time) VALUES (:u, :r, :t, :time)"), 
                     {"u": user_data['uniqueid'], "r": reason, "t": token, "time": slot_time})
        conn.commit()
    return f"Token {token} booked for {slot_time.strftime('%I:%M %p')}."

# ==============================================================================
# SECTION 4: GEMINI BRAIN (UNCHANGED)
# ==============================================================================

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
tools = [get_user_context, check_scheme_eligibility, book_appointment_slot]

model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    tools=tools,
    system_instruction="""
    You are Nalam, a helpful government kiosk assistant. 
    User input is spoken text. Keep your answers short, clear, and polite so they are easy to listen to.
    Always check 'get_user_context' first.
    """
)
chat = model.start_chat(enable_automatic_function_calling=True)

# ==============================================================================
# SECTION 5: MAIN LOOP
# ==============================================================================

def run_kiosk():
    audio = AudioHandler()
    print("--- Nalam Kiosk Started (Press Ctrl+C to stop) ---")
    
    # Initial Greeting
    audio.speak("Welcome to Nalam Kiosk. How can I help you today?")
    
    while True:
        try:
            # 1. HEAR
            user_text = audio.listen()
            
            if user_text:
                # 2. THINK
                response = chat.send_message(user_text)
                ai_reply = response.text
                
                # 3. SPEAK
                audio.speak(ai_reply)
                
            # Small delay to prevent instant re-listening loop
            time.sleep(1)
            
        except KeyboardInterrupt:
            print("\nStopping Kiosk...")
            break

if __name__ == "__main__":
    run_kiosk()