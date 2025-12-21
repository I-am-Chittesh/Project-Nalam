# Voice Pipeline Code Reference

## Complete Voice Input Flow

### 1. Request Microphone Permission
```javascript
async function requestAudioPermissions() {
  const permission = await Audio.getPermissionsAsync();
  if (permission.status !== 'granted') {
    const response = await Audio.requestPermissionsAsync();
    setRecordingPermission(response.status === 'granted');
  }
}
```
**When called**: On component mount (`useEffect`)
**Result**: Sets `recordingPermission` state, user sees permission prompt

---

### 2. Start Recording
```javascript
async function startRecording() {
  if (!recordingPermission) {
    alert('🎤 Microphone permission not granted');
    return;
  }
  
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const newRecorder = new Audio.Recording();
  await newRecorder.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  await newRecorder.startAsync();
  setRecorder(newRecorder);
  setRecording(true);
}
```
**Triggered by**: User pressing 🎤 button
**State changes**: `recording = true`, shows "🎤 Recording... Speak now"
**Audio format**: WAV, HIGH_QUALITY preset

---

### 3. Stop Recording & Get URI
```javascript
async function stopRecording() {
  if (!recorder) return;
  
  await recorder.stopAndUnloadAsync();
  const uri = recorder.getURI();  // File system path to WAV
  setRecorder(null);
  setRecording(false);
  
  if (uri) {
    await processVoiceInput(uri);
  }
}
```
**Triggered by**: User pressing ⏹️ button
**Returns**: File URI to WAV file saved on device
**Next step**: Automatically calls `processVoiceInput()`

---

### 4. Process Voice Input & Transcribe
```javascript
async function processVoiceInput(audioUri) {
  try {
    setLoading(true);

    // Create FormData with audio file
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/wav',
      name: 'recording.wav',
    });
    formData.append('language', language);  // 'en', 'hi', or 'ta'

    // Send to transcription endpoint
    const transcribeResponse = await fetch(
      `${API_SERVER}/api/transcribe`, 
      {
        method: 'POST',
        body: formData,
      }
    );

    const transcribeData = await transcribeResponse.json();
    
    if (!transcribeData.success) {
      throw new Error(transcribeData.error);
    }

    const transcribedText = transcribeData.text;  // "Can you help me?"

    // Show user's transcribed message
    const userMsg = {
      id: Date.now().toString(),
      from: 'you',
      text: `🎤 ${transcribedText}`
    };
    setMessages(prev => [userMsg, ...prev]);

    // Process with chat endpoint
    await sendMessage(transcribedText);
  } catch (error) {
    console.error('Voice input error:', error);
    // Show error message in chat
  } finally {
    setLoading(false);
  }
}
```
**HTTP Request**:
```
POST http://localhost:5000/api/transcribe
Content-Type: multipart/form-data

audio: <WAV file bytes>
language: en
```

**Expected Response**:
```json
{
  "success": true,
  "text": "Can you help me?",
  "language": "en",
  "confidence": 0.95
}
```

**What happens**:
1. WAV file is sent to API server
2. `speech_recognition` library converts audio to text
3. Language parameter determines transcription locale
4. Response appears with 🎤 emoji prefix

---

### 5. Send Message to AI
```javascript
async function sendMessage(userText) {
  try {
    setLoading(true);

    const response = await fetch(`${API_SERVER}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        language: language  // Persist language preference
      })
    });

    const data = await response.json();
    
    let responseText = data.response_text;
    
    // Show AI response
    const aiReply = {
      id: (Date.now() + 1).toString(),
      from: 'ai',
      text: responseText,
      language_code: data.language_code,
      use_db: data.use_db
    };
    
    setMessages(prev => [aiReply, ...prev]);

    // Synthesize and play audio
    await synthesizeAndPlayAudio(
      responseText, 
      data.language_code || language
    );
  } catch (error) {
    console.error('API Error:', error);
  } finally {
    setLoading(false);
  }
}
```

**Backend Process** (api_server.py):
1. **Decision Model**: "Do I need to query the database?"
   - Yes → Execute tool (check_scheme_eligibility, etc.)
   - No → Skip to response generation
2. **Response Model**: Generate multilingual response
3. Return both response text and detected language

---

### 6. Synthesize Audio Response
```javascript
async function synthesizeAndPlayAudio(text, lang) {
  try {
    setAudioPlaying(true);
    
    const cleanText = text.replace(/\n\n\[Tool:.*?\]/g, '');
    
    const response = await fetch(`${API_SERVER}/api/synthesize-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        language: lang  // 'en', 'hi', 'ta'
      })
    });

    const data = await response.json();

    if (data.success && data.uri) {
      await playAudioFromUri(data.uri);
    }
  } catch (error) {
    console.error('Audio synthesis error:', error);
  } finally {
    setAudioPlaying(false);
  }
}
```

**HTTP Request**:
```
POST http://localhost:5000/api/synthesize-audio
Content-Type: application/json

{
  "text": "Here are the available education schemes...",
  "language": "en"
}
```

**Expected Response**:
```json
{
  "success": true,
  "uri": "data:audio/mp3;base64,//NExAA..." // 2000+ chars
}
```

---

### 7. Play Audio Response
```javascript
async function playAudioFromUri(uri) {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri });  // Load from base64 data URI
    
    setAudioPlaying(true);  // Show 🔊 badge
    
    await sound.playAsync();
    
    // Wait for audio to finish
    await new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          setAudioPlaying(false);  // Hide 🔊 badge
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Audio playback error:', error);
  }
}
```

**What happens**:
1. Base64 data URI is converted to playable sound
2. Audio plays through device speakers (respects volume setting)
3. 🔊 badge shows during playback
4. Badge disappears when audio finishes

---

## Complete Message Flow Diagram

```
User presses 🎤
      ↓
startRecording()
- Creates Audio.Recording instance
- Starts capturing microphone input
- Shows "🎤 Recording... Speak now"
      ↓
User speaks: "Can you help me with scholarships?"
      ↓
User presses ⏹️
      ↓
stopRecording()
- Stops recording
- Gets WAV file URI
- Calls processVoiceInput(uri)
      ↓
processVoiceInput(uri)
- Creates FormData with audio file
- POST to /api/transcribe
      ↓
[Backend: speech_recognition.recognize_google()]
- Converts WAV → text
- Returns: "Can you help me with scholarships?"
      ↓
showUserMessage("🎤 Can you help me with scholarships?")
      ↓
sendMessage("Can you help me with scholarships?", language='en')
- POST to /api/chat
      ↓
[Backend: Gemini Decision Model]
- Detects user wants scholarship info
- Decides: YES, query database
- Calls: check_scheme_eligibility(user_id, category='education')
      ↓
[Backend: Gemini Response Model]
- Receives database results
- Generates: "Based on your profile, you're eligible for..."
- Returns language: "en" (detected from input)
      ↓
showAIMessage("Based on your profile, you're eligible for...")
      ↓
synthesizeAndPlayAudio(response_text, language='en')
- POST to /api/synthesize-audio
      ↓
[Backend: gTTS (Google Text-to-Speech)]
- Generates MP3 in English
- Returns base64 data URI
      ↓
playAudioFromUri(base64_data_uri)
- Loads and plays MP3 through speakers
- Shows 🔊 badge during playback
      ↓
Audio finishes playing
- 🔊 badge disappears
- Chat shows both voice input and voice output ✅
```

---

## State Management

### Recording States
```javascript
const [recording, setRecording] = useState(false);
const [recorder, setRecorder] = useState(null);
const [recordingPermission, setRecordingPermission] = useState(null);
```

| State | Value | Meaning |
|-------|-------|---------|
| `recording` | `false` | Not recording, 🎤 button is clickable |
| `recording` | `true` | Recording active, shows status banner, ⏹️ button clickable |
| `recordingPermission` | `null` | Permission not yet requested |
| `recordingPermission` | `true` | Microphone access granted, can record |
| `recordingPermission` | `false` | Microphone access denied, 🎤 button disabled |

### Message States
```javascript
const [messages, setMessages] = useState([...]);
const [language, setLanguage] = useState('en');
const [loading, setLoading] = useState(false);
const [audioPlaying, setAudioPlaying] = useState(false);
```

| State | Used for |
|-------|----------|
| `messages` | Chat history (user + AI messages) |
| `language` | Current language preference (en/hi/ta) |
| `loading` | True during transcription/AI processing, disables buttons |
| `audioPlaying` | True while audio is playing, shows 🔊 badge |

---

## Error Handling

### Permission Errors
```javascript
if (!recordingPermission) {
  alert('🎤 Microphone permission not granted. Please enable it in settings.');
  return;  // startRecording() aborts
}
```

### Recording Errors
```javascript
try {
  await newRecorder.startAsync();
} catch (error) {
  console.error('Recording error:', error);
  alert('❌ Failed to start recording');
}
```

### Transcription Errors
```javascript
if (!transcribeData.success) {
  throw new Error(transcribeData.error);
  // Becomes: "❌ Could not process voice: Could not understand audio"
}
```

### API Connection Errors
```javascript
try {
  const response = await fetch(`${API_SERVER}/api/chat`, {...});
} catch (error) {
  const errorMsg = {
    from: 'ai',
    text: `❌ ${error.message}\n\n1. API server running?\n2. Server on port 5000?`
  };
  setMessages(prev => [errorMsg, ...prev]);
}
```

---

## Language Persistence

### Flow
```javascript
// 1. User selects language (UI buttons)
<TouchableOpacity onPress={() => setLanguage('hi')}>
  Hindi
</TouchableOpacity>

// 2. Language passed to transcription
formData.append('language', language);  // 'hi'

// 3. Language passed to AI processing
{ message: userText, language: language }  // language: 'hi'

// 4. Language passed to audio synthesis
{ text: response, language: lang }  // lang: 'hi'

// 5. If AI detects different language, it updates
if (data.language_code && data.language_code !== language) {
  setLanguage(data.language_code);  // Auto-switch
}
```

### Locale Mapping (Backend)
```python
locale_map = {
  'en': 'en-IN',   # English (India)
  'hi': 'hi-IN',   # Hindi (Devanagari)
  'ta': 'ta-IN'    # Tamil (Tamil script)
}
```

---

## Testing Code Snippets

### Simulate Voice Input Programmatically
```javascript
// For debugging, simulate transcription without recording
const simulatedText = "Can you show me available schemes?";
const userMsg = {
  id: Date.now().toString(),
  from: 'you',
  text: `🎤 ${simulatedText}`
};
setMessages(prev => [userMsg, ...prev]);
await sendMessage(simulatedText);
```

### Test API Connectivity
```javascript
useEffect(() => {
  fetch(`${API_SERVER}/api/health`)
    .then(r => r.json())
    .then(data => console.log('✅ API alive:', data))
    .catch(err => console.error('❌ API offline:', err));
}, []);
```

### Verify Language Switching
```javascript
// In browser console (if testing web version)
setLanguage('hi');
console.log('Language switched to:', language);
// Send message and verify response is in Hindi
```

---

## Performance Metrics

| Operation | Time | Factor |
|-----------|------|--------|
| Permission request | Instant | User interaction |
| Recording startup | <100ms | expo-av initialization |
| Recording | Real-time | Continuous |
| Recording stop | <100ms | File save |
| Transcription | 1-3s | Network + speech_recognition API |
| AI processing | 2-5s | Gemini API latency |
| Audio synthesis | 1-2s | gTTS generation |
| Audio playback | Variable | Duration of response |
| **Total E2E** | **5-10s** | Typical flow |

---

## Browser Compatibility

| Component | Web Browser | Mobile | Note |
|-----------|-------------|--------|------|
| Voice recording | ❌ No | ✅ Yes | Uses expo-av (native) |
| Text transcription | ❌ No | ✅ Yes | Requires WAV file |
| AI chat | ✅ Yes | ✅ Yes | REST API |
| Audio synthesis | ✅ Yes | ✅ Yes | Base64 data URI |
| Audio playback | ✅ Yes (Web Audio API) | ✅ Yes (expo-av) | Works on both |

---

**Last Updated**: Voice implementation complete
**Status**: Ready for production testing
