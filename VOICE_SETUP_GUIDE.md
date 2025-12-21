# Voice AI Setup & Testing Guide

## Quick Start (3 Steps)

### Step 1: Start the API Server
```bash
# Terminal 1: In project root
cd D:\Projects\Project-Nalam
.\.venv\Scripts\activate
python api_server.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

### Step 2: Start the Expo App
```bash
# Terminal 2: In client folder
cd D:\Projects\Project-Nalam\client
npm start
```

Then press:
- **i** to open in iOS simulator (if on Mac)
- **a** to open in Android emulator (if Windows with Android Studio)
- **w** to open in web (for testing, but voice won't work in browser)

### Step 3: Test Voice Input
1. Open the AI Screen (HomeScreen → AI Mode)
2. Grant microphone permission when prompted
3. Press 🎤 button
4. Speak clearly: "Can you tell me about education schemes?"
5. Press ⏹️ to stop recording
6. Watch the magic happen! 

Expected flow:
```
🎤 Recording... Speak now  ← Shows during recording
                          ↓
🎤 Can you tell me about education schemes?  ← Your transcribed voice
                          ↓
⏳ Processing...  ← AI is thinking
                          ↓
🔊 Response from AI...  ← AI speaks back
```

---

## Troubleshooting

### Problem: "Microphone permission not granted"
**Solution**: 
- Android: Go to App Settings → Permissions → Grant Microphone
- iOS: Settings → App → Nalam → Microphone → Allow

### Problem: "Could not process voice: Could not understand audio"
**Solution**:
- Speak more clearly and louder
- Reduce background noise
- Try again - speech recognition isn't 100% accurate

### Problem: "Could not connect to AI service"
**Solution**:
1. Check API server is running: `python api_server.py`
2. Check terminal has no errors
3. Verify API_SERVER = 'http://localhost:5000' in AIInteractiveScreen.js
4. On Android emulator: Use `10.0.2.2` instead of `localhost`

### Problem: Text gets cut off in input box
**Solution**: Already handled - input box has `maxLength={500}` and expands up to 100px

### Problem: No audio playing after response
**Solution**:
1. Check volume isn't muted
2. Check gTTS is installed: `pip install gtts`
3. Check `/api/synthesize-audio` endpoint responds correctly
4. Try restarting the app

---

## Testing Checklist

### Voice Recording Test
- [ ] Press 🎤 button
- [ ] See "🎤 Recording... Speak now"
- [ ] Speak test phrase: "Hello world"
- [ ] Press ⏹️ button
- [ ] Recording stops and processes

### Transcription Test
- [ ] After recording, see message with 🎤 emoji
- [ ] Text should match what you said
- [ ] If accuracy is bad, retry with clearer speech

### AI Response Test
- [ ] See AI response appear in chat
- [ ] Response is relevant to your question
- [ ] Response language matches your language preference

### Audio Playback Test
- [ ] See 🔊 badge during audio playing
- [ ] Hear AI response in the correct language
- [ ] Audio quality is natural (gTTS is Google-quality)

### Language Switching Test
- [ ] Press English (🇬🇧) button
- [ ] Record: "Hello, I need help"
- [ ] AI responds in English ✅
- [ ] Press Hindi (🇮🇳) button
- [ ] Record: "नमस्ते, मुझे मदद चाहिए" (in Hindi)
- [ ] AI responds in Hindi ✅
- [ ] Press Tamil (🇮🇳) button  
- [ ] Record: "வணக்கம், எனக்கு உதவி தேவை" (in Tamil)
- [ ] AI responds in Tamil ✅

### Database Integration Test
- [ ] Press English button
- [ ] Ask: "What schemes am I eligible for?"
- [ ] See response with 🔧 Database query tag
- [ ] AI responds with personalized schemes

### Error Handling Test
- [ ] Click 🎤 and immediately ⏹️ (silent audio)
- [ ] Should see: "❌ Could not process voice: Could not understand audio"
- [ ] Type and send message instead ✅

---

## Architecture at a Glance

```
Your Voice (Microphone)
        ↓
expo-av Audio.Recording (Records WAV)
        ↓
/api/transcribe (speech_recognition)
        ↓
✍️ Message in chat + Transcribed text
        ↓
/api/chat (Gemini Decision Model + Database Tools + Response Model)
        ↓
🔧 [Optional] Database query if needed
        ↓
/api/synthesize-audio (gTTS MP3 generation)
        ↓
expo-av Audio.Sound (Plays response)
        ↓
🔊 AI Voice Response
```

---

## Key Files Modified

| File | Change | Status |
|------|--------|--------|
| `client/screens/AIInteractiveScreen.js` | Added voice recording, transcription, and audio playback | ✅ Complete |
| `api_server.py` | Already has `/api/transcribe` endpoint | ✅ Ready |
| `nalam.py` | Reference implementation (unchanged) | ✅ Working |
| `client/package.json` | expo-av already installed | ✅ Ready |

---

## Performance Notes

- **Recording**: Real-time, no latency
- **Transcription**: ~1-3 seconds (network dependent)
- **AI Processing**: ~2-5 seconds (Gemini API latency)
- **Audio Synthesis**: ~1-2 seconds (gTTS generation)
- **Total E2E**: ~5-10 seconds from voice input to voice output

---

## Next Steps

1. **Test Now** (5 minutes)
   - Start API server
   - Start Expo app
   - Record a message and verify it works

2. **Customize** (optional)
   - Change welcome message in `playWelcomeAudio()`
   - Adjust language preference buttons
   - Modify styling in `styles` object

3. **Deploy** (production)
   - Build APK: `eas build --platform android`
   - Build IPA: `eas build --platform ios`
   - Upload to Play Store / App Store

---

**Need help?** Check the VOICE_INTEGRATION_SUMMARY.md for detailed architecture
