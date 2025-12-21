"""
Enhanced Flask API server wrapping nalam.py's full AI capabilities.
Exposes multimodal AI with language detection, database integration, and audio synthesis.
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.genai as genai
from sqlalchemy import create_engine, text

# ============================================================================
# CONFIGURATION
# ============================================================================

PRIMARY_GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY_PRIMARY") or "AIzaSyDqBrTJOy8bGnZToQmn-Xajp-h8vMj_8DQ"
SECONDARY_GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY_SECONDARY") or "AIzaSyCpmLq58_7uqFQqHMLIVpc9YLSXEAscCCc"
API_KEYS = [PRIMARY_GEMINI_API_KEY, SECONDARY_GEMINI_API_KEY]

DB_URL = "postgresql://postgres:admin_nalam@db.apmogbrgeasetudeumdx.supabase.co:5432/postgres"
engine = create_engine(DB_URL)

current_api_key_index = 0

app = Flask(__name__)
CORS(app)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _configure_genai(api_key: str):
    os.environ["GOOGLE_API_KEY"] = api_key
    genai.configure(api_key=api_key)

_configure_genai(API_KEYS[current_api_key_index])

def _lang_to_locale(lang_code: str) -> str:
    """Map language code to locale for STT."""
    return {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
    }.get(lang_code, 'en-IN')

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """
    Transcribe audio file to text using Google Speech Recognition.
    
    Request: multipart/form-data
    {
        "audio": <audio file>,
        "language": "en"  // 'en', 'hi', or 'ta'
    }
    
    Response:
    {
        "success": true,
        "text": "What services are available?",
        "language": "en",
        "confidence": 0.95
    }
    """
    try:
        import speech_recognition as sr
        import tempfile
        import os

        # Input validation and logging
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400
        audio_file = request.files['audio']
        language = request.form.get('language', 'en')

        if not audio_file or audio_file.filename == '':
            return jsonify({'success': False, 'error': 'No audio file selected'}), 400

        print(f"🔎 Incoming audio: filename={audio_file.filename}, mimetype={audio_file.mimetype}")

        # Map language to locale for STT
        locale_map = {'en': 'en-IN', 'hi': 'hi-IN', 'ta': 'ta-IN'}
        lang_locale = locale_map.get(language, 'en-IN')

        # Save input to a temp file with original extension if available
        _, ext = os.path.splitext(audio_file.filename or '')
        ext = ext.lower() if ext else ''
        with tempfile.NamedTemporaryFile(suffix=ext or '.bin', delete=False) as tmp_in:
            audio_file.save(tmp_in.name)
            tmp_in_path = tmp_in.name

        wav_path = None
        conversion_error = None

        # Try to convert any format to 16-bit PCM WAV (mono, 16kHz)
        try:
            from pydub import AudioSegment
            segment = AudioSegment.from_file(tmp_in_path)
            segment = segment.set_channels(1).set_frame_rate(16000)
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_out:
                segment.export(tmp_out.name, format='wav')
                wav_path = tmp_out.name
            print(f"🔁 Converted input ({ext or 'unknown'}) to WAV for STT: {wav_path}")
        except Exception as e:
            conversion_error = e
            # If input is already WAV, proceed without conversion
            if ext == '.wav' or audio_file.mimetype in ('audio/wav', 'audio/x-wav'):
                wav_path = tmp_in_path
                print("ℹ️ Using uploaded WAV without conversion")
            else:
                print(f"⚠️ Audio conversion failed (pydub/ffmpeg missing?): {e}")

        # If we still don't have a WAV path, return a helpful error
        if not wav_path:
            # Clean up input temp file
            try:
                os.unlink(tmp_in_path)
            except Exception:
                pass
            return jsonify({
                'success': False,
                'error': 'Audio format not supported. Please record in WAV or install ffmpeg+pydub on the server.'
            }), 400

        # Transcribe audio using Google Speech Recognition
        recognizer = sr.Recognizer()
        try:
            with sr.AudioFile(wav_path) as source:
                audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language=lang_locale)

            # Clean up temp files
            try:
                os.unlink(tmp_in_path)
            except Exception:
                pass
            try:
                if wav_path and wav_path != tmp_in_path:
                    os.unlink(wav_path)
            except Exception:
                pass

            print(f"✅ Transcribed ({language}): {text}")
            return jsonify({
                'success': True,
                'text': text,
                'language': language,
                'confidence': 0.9
            }), 200

        except sr.UnknownValueError:
            # Clean up temp files
            try:
                os.unlink(tmp_in_path)
            except Exception:
                pass
            try:
                if wav_path and wav_path != tmp_in_path:
                    os.unlink(wav_path)
            except Exception:
                pass
            return jsonify({
                'success': False,
                'error': 'Could not understand audio. Please try again.',
                'text': ''
            }), 400
        except sr.RequestError as e:
            # Clean up temp files
            try:
                os.unlink(tmp_in_path)
            except Exception:
                pass
            try:
                if wav_path and wav_path != tmp_in_path:
                    os.unlink(wav_path)
            except Exception:
                pass
            return jsonify({
                'success': False,
                'error': f'Speech recognition error: {e}',
                'text': ''
            }), 500

    except ImportError:
        return jsonify({
            'success': False,
            'error': 'speech_recognition not installed. Run: pip install SpeechRecognition'
        }), 500
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

def get_user_context():
    """Fetch user profile from 'app_main'."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM app_main LIMIT 1")).mappings().fetchone()
            if not result: 
                return "No user logged in."
            available_docs = [k for k, v in result.items() if v is not None and k not in ['name', 'uniqueid']]
            return {"name": result['name'], "uniqueid": result['uniqueid'], "documents": available_docs}
    except Exception as e:
        return f"Database error: {e}"

def check_scheme_eligibility(scheme_name: str):
    """Check user's eligibility for a scheme."""
    try:
        user_data = get_user_context()
        if isinstance(user_data, str): 
            return user_data
        with engine.connect() as conn:
            scheme = conn.execute(text("SELECT * FROM schemes WHERE name ILIKE :s"), {"s": f"%{scheme_name}%"}).mappings().fetchone()
            if not scheme: 
                return "Scheme not found."
            missing = set(scheme['required_docs']) - set(user_data['documents'])
            return f"Eligible." if not missing else f"Missing docs: {', '.join(missing)}"
    except Exception as e:
        return f"Error checking scheme: {e}"

def book_appointment_slot(reason: str):
    """Book an appointment slot."""
    try:
        user_data = get_user_context()
        if isinstance(user_data, str): 
            return user_data
        with engine.connect() as conn:
            conn.execute(text("INSERT INTO appointments (user_uniqueid, service_requested, token_number, slot_time) VALUES (:u, :r, 101, NOW())"), 
                         {"u": user_data['uniqueid'], "r": reason})
            conn.commit()
        return "Token 101 Booked."
    except Exception as e:
        return f"Error booking appointment: {e}"

def fetch_certificates(certificate_type: str = None):
    """Fetch government certificates."""
    try:
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
                except:
                    continue
        return "No certificates found for this user."
    except Exception as e:
        return f"Error fetching certificates: {e}"

# ============================================================================
# SYSTEM PROMPTS
# ============================================================================

DECISION_SYSTEM = """
You are a concise assistant that reads a user's message and decides
whether calling a backend database or tool is required.

Return EXACTLY one JSON object (no extra text) with these fields:
    - use_db: true or false
    - requested_tool: string name of the tool to call (one of get_user_context, check_scheme_eligibility, book_appointment_slot, fetch_certificates) or null
    - tool_args: object with arguments for the tool (or {} if none)
    - language_code: 'en', 'hi' or 'ta'

Make a conservative decision: only set use_db=true when the user clearly requests data, bookings, eligibility checks or fetching certificates. 
If the user is chit-chatting, asking for help, greetings, or general information, set use_db=false.
Keep responses protective of user privacy: never request or invent user identifiers.
"""

RESPONSE_SYSTEM = """
You are Nalam, a friendly multilingual kiosk assistant. Be warm, approachable and concise.
When given the user's message and optionally a 'tool_result' (database output), produce a JSON object:
    {"response_text": "...", "language_code": "en|hi|ta"}
Reply in the same language as 'language_code'. Keep phrasing simple and helpful for all users.
"""

# ============================================================================
# API FAILOVER LOGIC
# ============================================================================

def send_with_fallback(system_instruction, prompt, primary_model='gemini-2.5-flash', fallback_model='gemini-2.5-flash-lite'):
    """Send a prompt with API-key and model failover."""
    global current_api_key_index
    last_error = None

    def _attempt(key_idx: int, model_name: str):
        _configure_genai(API_KEYS[key_idx])
        model = genai.GenerativeModel(model_name=model_name, system_instruction=system_instruction)
        chat = model.start_chat()
        return chat.send_message(prompt)

    # Try primary model with current key
    try:
        res = _attempt(current_api_key_index, primary_model)
        return res
    except Exception as e:
        last_error = e
        print(f"⚠️ Primary model failed with key #{current_api_key_index + 1}: {e}")

    # Try other key on primary model
    for alt_idx in range(len(API_KEYS)):
        if alt_idx == current_api_key_index:
            continue
        try:
            res = _attempt(alt_idx, primary_model)
            current_api_key_index = alt_idx
            return res
        except Exception as e:
            last_error = e
            print(f"⚠️ Alternate key #{alt_idx + 1} failed: {e}")

    # Try fallback model with both keys
    for alt_idx in [current_api_key_index] + [i for i in range(len(API_KEYS)) if i != current_api_key_index]:
        try:
            res = _attempt(alt_idx, fallback_model)
            current_api_key_index = alt_idx
            return res
        except Exception as e:
            last_error = e
            print(f"⚠️ Fallback model failed with key #{alt_idx + 1}: {e}")

    raise last_error

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'message': 'Nalam AI API Server is running',
        'version': '1.0',
        'features': ['chat', 'multilingual', 'language-persistence', 'database-integration']
    }), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Process user message and return AI response with language persistence.
    
    Request:
    {
        "message": "What services are available?",
        "language": "en",
        "tool_result": {}
    }
    
    Response:
    {
        "response_text": "Welcome! We offer various government services...",
        "language_code": "en",
        "use_db": false,
        "requested_tool": null
    }
    """
    try:
        data = request.json or {}
        user_message = data.get('message', '').strip()
        language_code = data.get('language', 'en')
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400

        # STEP 1: Determine if DB access is needed
        decision_prompt = (
            f"User message: {user_message}\n"
            f"Language preference (persist unless user switches): {language_code}\n"
            "Decide whether a database/tool call is needed. Respond with the JSON object described in the system instruction."
        )
        
        decision = {"use_db": False, "requested_tool": None, "tool_args": {}, "language_code": language_code}
        tool_result = None
        
        try:
            dec_res = send_with_fallback(DECISION_SYSTEM, decision_prompt)
            dec_text = dec_res.text.replace("```json", "").replace("```", "").strip()
            decision = json.loads(dec_text)
            
            # Update language preference from decision if present
            if decision.get('language_code'):
                language_code = decision.get('language_code')
            
            # STEP 2: Execute database tool if needed
            if decision.get('use_db'):
                tool_name = decision.get('requested_tool')
                tool_args = decision.get('tool_args') or {}
                
                tools_map = {
                    'get_user_context': lambda: get_user_context(),
                    'check_scheme_eligibility': lambda: check_scheme_eligibility(tool_args.get('scheme_name', '')),
                    'book_appointment_slot': lambda: book_appointment_slot(tool_args.get('reason', '')),
                    'fetch_certificates': lambda: fetch_certificates(tool_args.get('certificate_type'))
                }
                
                if tool_name in tools_map:
                    try:
                        tool_result = tools_map[tool_name]()
                        print(f"✅ Tool {tool_name} executed successfully")
                    except Exception as e:
                        tool_result = f"Tool error: {e}"
                else:
                    tool_result = f"Tool '{tool_name}' not found"
        except Exception as e:
            print(f"⚠️ Decision parsing error: {e}")

        # STEP 3: Generate final response
        response_prompt = (
            f"User message: {user_message}\n"
            f"Tool result: {json.dumps(tool_result) if tool_result else 'No tool result'}\n"
            f"Language preference (persist unless user switches): {language_code}\n"
            "Produce exactly one JSON object: {\"response_text\": ..., \"language_code\": ...}"
        )
        
        res = send_with_fallback(RESPONSE_SYSTEM, response_prompt)
        clean_text = res.text.replace("```json", "").replace("```", "").strip()
        
        try:
            response_data = json.loads(clean_text)
        except json.JSONDecodeError:
            response_data = {
                "response_text": clean_text,
                "language_code": language_code
            }
        
        # Always include decision info in response
        response_data['use_db'] = decision.get('use_db', False)
        response_data['requested_tool'] = decision.get('requested_tool')
        
        # Update language if response specifies one
        if response_data.get('language_code'):
            language_code = response_data.get('language_code')
        
        return jsonify(response_data), 200
    
    except Exception as e:
        print(f"❌ Error in /api/chat: {e}")
        return jsonify({'error': str(e), 'response_text': 'Sorry, I encountered an error. Please try again.'}), 500

@app.route('/api/synthesize-audio', methods=['POST'])
def synthesize_audio():
    """Synthesize text-to-speech audio (for future audio integration)."""
    try:
        data = request.json or {}
        text = data.get('text', '').strip()
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        try:
            from gtts import gTTS
            import base64
            import tempfile
            import os
            
            # Map language code to gTTS lang parameter
            lang_map = {'en': 'en', 'hi': 'hi', 'ta': 'ta'}
            gtts_lang = lang_map.get(language, 'en')
            
            # Generate audio with gTTS
            tts = gTTS(text=text, lang=gtts_lang, slow=False)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
                tts.save(tmp.name)
                tmp_path = tmp.name
            
            # Read file and encode to base64
            with open(tmp_path, 'rb') as f:
                audio_data = f.read()
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            # Encode as base64 data URI
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            audio_uri = f"data:audio/mpeg;base64,{audio_base64}"
            
            return jsonify({
                'success': True,
                'uri': audio_uri,
                'language': language,
                'message': 'Audio generated successfully'
            }), 200
        
        except ImportError:
            return jsonify({
                'error': 'gTTS not installed. Run: pip install gtts',
                'success': False
            }), 500
        except Exception as e:
            print(f"❌ Error in audio synthesis: {e}")
            return jsonify({'error': str(e), 'success': False}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/language-preference', methods=['POST'])
def set_language_preference():
    """Set/update language preference for a session."""
    try:
        data = request.json or {}
        language = data.get('language', 'en')
        
        if language not in ['en', 'hi', 'ta']:
            return jsonify({'error': 'Unsupported language. Use: en, hi, ta'}), 400
        
        return jsonify({
            'language': language,
            'message': f'Language preference set to {language}'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Nalam Enhanced API Server...")
    print("\nAvailable endpoints:")
    print("  GET  /api/health                  - Server health check")
    print("  POST /api/chat                    - Main chat endpoint with AI & DB integration")
    print("  POST /api/synthesize-audio        - Text-to-speech endpoint")
    print("  POST /api/language-preference     - Set language preference")
    print("\nServer running on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
