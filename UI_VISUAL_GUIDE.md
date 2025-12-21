# Visual UI Guide: Voice AI Assistant

## Screen Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  🤖 Nalam AI              🟢 connected    🔊   │  ← Header
│  Voice-Enabled Assistant                       │
│                                                 │
├─────────────────────────────────────────────────┤
│ Language: 🇬🇧 English                          │
│ [🇬🇧 English]  [🇮🇳 Hindi]  [🇮🇳 Tamil]      │  ← Language Selector
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │                                         │  │
│  │         🤖 Welcome to Nalam AI.         │  │
│  │     Speak or type in English, Hindi,    │  │
│  │              or Tamil.                  │  │
│  │                                         │  │
│  │                                         │  │
│  │  🎤 Hello, can you help me?             │  │
│  │  (User's transcribed voice)             │  │
│  │                                         │  │
│  │  Sure! I can help you with that.        │  │  ← Chat Messages
│  │  Based on your profile, you're...       │  │
│  │  🔧 Database query                      │  │
│  │                                         │  │
│  │  ✍️ I need information about schemes    │  │
│  │  (User typed this message)              │  │
│  │                                         │  │
│  │  There are several government schemes   │  │
│  │  available for your profile...          │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
├─────────────────────────────────────────────────┤
│ 🎤 Recording... Speak now        ⏳            │  ← Recording Status
│                                    (hidden normally)
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │ Type or press 🎤 to speak...           │   │
│  └────────────────────────────────────────┘   │  ← Input Area
│  [🎤] [Send]                                   │
│                                                 │
├─────────────────────────────────────────────────┤
│ [ℹ️ About]                  [← Back]           │  ← Footer
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Button States & Interactions

### Voice Recording Button (🎤)

#### Default State (Not Recording)
```
┌─────────────────────────┐
│         🎤              │  Cyan border & background
│   (Tappable)            │  Shadow effect
└─────────────────────────┘
    ↓
    User presses button
    ↓
    Recording starts
```

#### Recording State (Active)
```
┌─────────────────────────┐
│         ⏹️              │  Red border & background
│   (Stop Recording)      │  Shadow changes to red
└─────────────────────────┘
    ↓
    User presses ⏹️
    ↓
    Recording stops + Transcribe
```

#### Disabled State (No Permission)
```
┌─────────────────────────┐
│         🎤              │  Grayed out (opacity 0.5)
│   (Disabled)            │  Not tappable
└─────────────────────────┘
    Display: "Grant microphone permission"
```

---

## Recording Status Banner

### Appears Only During Recording

```
┌─────────────────────────────────────────────────┐
│  🎤 Recording... Speak now           ⏳         │  ← Cyan border
│  (animated spinner)                            │
└─────────────────────────────────────────────────┘
```

**Hidden When**:
- Not recording
- Finished recording

**Visible When**:
- User pressed 🎤 button
- Recording is in progress
- Auto-hides when ⏹️ pressed

---

## Message Types & Emoji Prefixes

### Voice Input Message
```
┌──────────────────────────┐
│ 🎤 Hello, how can you    │
│    help me?              │
│                          │
│ (Message from user's     │
│  transcribed speech)     │
└──────────────────────────┘
Right-aligned bubble with cyan border
```

### Text Input Message
```
┌──────────────────────────┐
│ ✍️ I need a scholarship   │
│    for education          │
│                          │
│ (User typed this)        │
└──────────────────────────┘
Right-aligned bubble with cyan border
```

### AI Response Message
```
┌──────────────────────────┐
│ Sure! Based on your      │
│ profile, you're          │
│ eligible for:            │
│ - Scheme A               │
│ - Scheme B               │
│ 🔧 Database query        │
│                          │
│ (AI generated response)  │
└──────────────────────────┘
Left-aligned bubble with light blue border
```

---

## Language Selector

### Layout
```
Language: 🇬🇧 English

[🇬🇧 English]  [🇮🇳 Hindi]  [🇮🇳 Tamil]
```

### Default State (English Selected)
```
[🇬🇧 English]  - Cyan background, bold text
 🇮🇳 Hindi     - Transparent, light text
 🇮🇳 Tamil     - Transparent, light text
```

### After Selecting Hindi
```
 🇬🇧 English   - Transparent, light text
[🇮🇳 Hindi]    - Cyan background, bold text
 🇮🇳 Tamil     - Transparent, light text
```

### Effect
```
User taps [language button]
    ↓
Language state updates
    ↓
Future messages use that language
    ↓
If AI detects different language, it auto-switches
```

---

## Header Status Indicator

### Colors & Meanings

#### 🟢 Connected
```
Status Indicator: Green circle
Text: "connected"
API: ✅ Working
Buttons: Enabled
```

#### 🔴 Offline
```
Status Indicator: Red circle
Text: "offline"
API: ❌ Not responding
Buttons: Disabled or showing error message
```

#### 🟠 Checking
```
Status Indicator: Orange circle
Text: "checking"
API: ⏳ Testing connection
Buttons: May be disabled temporarily
```

#### 🔊 Audio Playing
```
Badge: "🔊" appears next to status
Means: AI is speaking the response
Disappears: When audio finishes
```

---

## Input Row Layout

### Text Input + Voice + Send Buttons
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌──────────────────────────────┐  [🎤] [Send]    │
│  │ Type or press 🎤 to speak..  │                 │
│  └──────────────────────────────┘                 │
│                                                    │
│  Flex Layout:                                      │
│  - TextInput: flex: 1 (takes remaining space)      │
│  - VoiceButton: paddingHorizontal: 12              │
│  - SendButton: paddingHorizontal: 14               │
│                                                    │
└─────────────────────────────────────────────────────┘
```

### Button Sizes
```
Voice Button (🎤):
  Width: 44px
  Height: 48px (bottom-aligned with input)
  
Send Button:
  Width: 52px (min-width)
  Height: 48px (bottom-aligned)
  
Text Input:
  Min-height: 44px
  Max-height: 100px (multiline)
  Expands as user types more lines
```

---

## Error Messages

### Permission Denied
```
┌──────────────────────────────────────┐
│                                      │
│  ❌ Cannot Access Microphone         │
│                                      │
│  "🎤 Microphone permission not       │
│   granted. Please enable it in       │
│   settings."                         │
│                                      │
│                    [OK]              │
│                                      │
└──────────────────────────────────────┘
Alert Dialog appears above UI
```

### Transcription Failed
```
Message appears in chat:

┌──────────────────────────────────────┐
│                                      │
│ ❌ Could not process voice:          │
│ Could not understand audio.          │
│ Please try again.                    │
│                                      │
└──────────────────────────────────────┘

User can either:
- Record again with clearer speech
- Type a message instead
```

### API Connection Failed
```
Message appears in chat:

┌──────────────────────────────────────┐
│                                      │
│ ❌ Could not connect to AI service   │
│                                      │
│ Make sure:                           │
│ 1. API server is running:            │
│    python api_server.py              │
│ 2. Server is on port 5000            │
│                                      │
└──────────────────────────────────────┘

User needs to:
- Start API server in terminal
- Restart app or retry message
```

---

## About Modal

### When Opened
```
┌─────────────────────────────────────────────┐
│                                             │
│ About Nalam AI                              │
│                                             │
│ Voice + Text Input                          │
│ Press 🎤 to record voice in English,        │
│ Hindi, or Tamil. Your speech will be        │
│ transcribed and processed.                  │
│                                             │
│ Multilingual Support                        │
│ Automatic language detection and            │
│ persistence throughout your conversation.   │
│                                             │
│ Smart Database Integration                  │
│ Automatically queries government service    │
│ databases when needed for:                  │
│ • User context & profiles                   │
│ • Scheme eligibility                        │
│ • Appointment bookings                      │
│ • Certificate fetching                      │
│                                             │
│ Powered by                                  │
│ Gemini 2.5 Flash AI with automatic API      │
│ key failover for reliability.               │
│                                             │
│ Server Status                               │
│ API: ✅ Connected                            │
│                                             │
├─────────────────────────────────────────────┤
│                  [Close]                    │
│                                             │
└─────────────────────────────────────────────┘

Modal closes when user taps [Close] button
```

---

## Accessibility Features

### Color Indicators
```
Element              Color           RGB
────────────────────────────────────────────
Primary Accent       Cyan            #2ee3bb
Success              Green           ✅ Connected
Error                Red             ❌ Error
Warning              Orange          ⚠️ Checking
User Message Bg      Cyan (dim)      rgba(46,227,187,0.28)
AI Message Bg        Light Blue      rgba(255,255,255,0.13)
Recording Status     Cyan            rgba(46,227,187,0.2)
Text                 White           #FFFFFF
Subtle Text          Light Blue      #D8DEEA
```

### Font Weights
```
Title (🤖 Nalam AI)      900 (Bold)
Subtitle                 600 (Semi-bold)
Message Text             600 (Semi-bold)
Status Text              700 (Bold)
Language Buttons         700 (Bold)
Send Button              900 (Extra Bold)
```

---

## Animation States

### Recording Status Banner
```
When shown: Smooth fade-in
Spinner: Rotating loading indicator (expo Activity Indicator)
When hidden: Smooth fade-out
```

### Button Press Feedback
```
On tap:
- Voice Button: Opacity change + shadow shift
- Send Button: Opacity change + shadow shift
- Language Button: Background color transition

No ripple effect (iOS/Android native preferred)
```

### Audio Playing Badge (🔊)
```
When audio starts:
- Badge appears next to status
When audio ends:
- Badge disappears
Appears as: Text emoji (no animation needed)
```

---

## Responsive Behavior

### Portrait Mode (Normal)
```
Full screen layout as shown above
All buttons fit horizontally at bottom
Messages use max-width: 85% of screen
```

### Landscape Mode
```
Chat area reduced vertically
Input row may need adjustment
Buttons remain accessible at bottom right
Messages width reduced proportionally
```

### Tablet Mode
```
Same as portrait but with wider chat
Messages use less than 85% width
More padding around edges
Buttons remain sized appropriately
```

---

## Gesture Interactions

### Single Tap
```
🎤 Button → startRecording()
⏹️ Button → stopRecording()
Language Button → setLanguage(code)
Send Button → send() / sendMessage()
ℹ️ About → Show modal
← Back → navigation.goBack()
Close Button → Hide modal
```

### Long Press
```
Message Bubble → [Optional future: Copy text, Share, Delete]
```

### Swipe
```
Left-swipe message → [Optional future: Mark as useful/not useful]
Up-swipe chat → Pull to refresh history
```

---

**UI Status**: ✅ Complete and production-ready
**Tested on**: React Native with Expo
**Platform**: iOS and Android
**Accessibility**: WCAG compliant color contrast, clear button states
