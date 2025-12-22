import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { Audio } from 'expo-av';

// Use your machine's IP address here. Replace with your actual IP (e.g., 192.168.x.x)
// For development, you can find your IP by running: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_SERVER = 'http://192.168.1.100:5000'; // Change this to your machine's IP address

export default function AIInteractiveScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '0', from: 'ai', text: '🤖 Welcome to Nalam AI Assistant', subtitle: 'Speak or type in English, Hindi, or Tamil' }
  ]);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [toolInfo, setToolInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState(null);
  const [recorder, setRecorder] = useState(null);

  // Check server health, request permissions, and play welcome audio on mount
  useEffect(() => {
    checkServerHealth();
    requestAudioPermissions();
    playWelcomeAudio();
  }, []);

  async function requestAudioPermissions() {
    try {
      const permission = await Audio.getPermissionsAsync();
      if (permission.status !== 'granted') {
        const response = await Audio.requestPermissionsAsync();
        setRecordingPermission(response.status === 'granted');
      } else {
        setRecordingPermission(true);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setRecordingPermission(false);
    }
  }

  async function checkServerHealth() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_SERVER}/api/health`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        setServerStatus('connected');
      } else {
        setServerStatus('error');
      }
    } catch (error) {
      // Silently fail - server is optional for the app to function
      setServerStatus('offline');
    }
  }

  async function playWelcomeAudio() {
    try {
      setAudioPlaying(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_SERVER}/api/synthesize-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Welcome to Nalam AI. You can speak or type your message.',
          language: 'en'
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.uri) {
        await playAudioFromUri(data.uri);
      }
    } catch (error) {
      // Silently fail - the app will still work without welcome audio
      // This is important because the server may not be accessible from mobile devices
    } finally {
      setAudioPlaying(false);
    }
  }

  async function playAudioFromUri(uri) {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      await sound.playAsync();
      
      await new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }

  async function startRecording() {
    if (!recordingPermission) {
      alert('🎤 Microphone permission not granted. Please enable it in settings.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      // Prefer WAV output so backend STT can read it reliably
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          sampleRate: 44100,
          numberOfChannels: 1,
        },
        web: {},
      };

      const newRecorder = new Audio.Recording();
      await newRecorder.prepareToRecordAsync(recordingOptions);
      await newRecorder.startAsync();
      setRecorder(newRecorder);
      setRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('❌ Failed to start recording');
    }
  }

  async function stopRecording() {
    if (!recorder) return;

    try {
      await recorder.stopAndUnloadAsync();
      const uri = recorder.getURI();
      setRecorder(null);
      setRecording(false);

      if (uri) {
        await processVoiceInput(uri);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      alert('❌ Error stopping recording');
    }
  }

  async function processVoiceInput(audioUri) {
    try {
      setLoading(true);

      const formData = new FormData();
      if (Platform.OS === 'web') {
        // Web: fetch the blob and send bytes
        const fileResponse = await fetch(audioUri);
        const blob = await fileResponse.blob();
        formData.append('audio', blob, 'recording.wav');
      } else {
        // Native: pass the file descriptor object
        formData.append('audio', {
          uri: audioUri,
          type: 'audio/wav',
          name: 'recording.wav',
        });
      }
      formData.append('language', language);

      // Send to transcription endpoint
      const transcribeResponse = await fetch(`${API_SERVER}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error(`Transcription failed: ${transcribeResponse.status}`);
      }

      const transcribeData = await transcribeResponse.json();

      if (!transcribeData.success) {
        throw new Error(transcribeData.error || 'Transcription failed');
      }

      const transcribedText = transcribeData.text;
      console.log('📝 Transcribed:', transcribedText);

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
      const errorMsg = {
        id: Date.now().toString(),
        from: 'ai',
        text: `❌ Could not process voice: ${error.message}`
      };
      setMessages(prev => [errorMsg, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      from: 'you',
      text: `✍️ ${input}`
    };
    setMessages(prev => [userMsg, ...prev]);
    setInput('');

    await sendMessage(input);
  }

  async function sendMessage(userText) {
    try {
      setLoading(true);
      setToolInfo(null);

      const response = await fetch(`${API_SERVER}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      let responseText = data.response_text || 'No response received.';

      if (data.use_db && data.requested_tool) {
        setToolInfo({
          tool: data.requested_tool,
          result: data.tool_result
        });
        responseText += `\n\n[Tool: ${data.requested_tool}]`;
      }

      const aiReply = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: responseText,
        language_code: data.language_code,
        use_db: data.use_db
      };

      if (data.language_code && data.language_code !== language) {
        setLanguage(data.language_code);
      }

      setMessages(prev => [aiReply, ...prev]);

      // Synthesize and play audio response
      await synthesizeAndPlayAudio(responseText, data.language_code || language);
    } catch (error) {
      console.error('API Error:', error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: `❌ ${error.message || 'Could not connect to AI service'}\n\nMake sure:\n1. API server is running: python api_server.py\n2. Server is on port 5000`
      };
      setMessages(prev => [errorMsg, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  async function synthesizeAndPlayAudio(text, lang) {
    try {
      setAudioPlaying(true);

      const cleanText = text.replace(/\n\n\[Tool:.*?\]/g, '');

      const response = await fetch(`${API_SERVER}/api/synthesize-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          language: lang
        })
      });

      if (!response.ok) {
        throw new Error(`Audio synthesis failed: ${response.status}`);
      }

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

  const getLanguageName = (code) => {
    return { 'en': '🇬🇧 English', 'hi': '🇮🇳 Hindi', 'ta': '🇮🇳 Tamil' }[code] || code;
  };

  const getServerStatusColor = () => {
    switch(serverStatus) {
      case 'connected': return '#2ee3bb';
      case 'offline': return '#ff6b6b';
      default: return '#ffac5e';
    }
  };

  return (
    <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.bgImage}
        blurRadius={26}
    >
      <View style={styles.scrim}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header with status */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>🤖 Nalam AI</Text>
              <Text style={styles.subtitle}>Voice-Enabled Assistant</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.statusIndicator, { backgroundColor: getServerStatusColor() }]} />
              <Text style={styles.statusText}>{serverStatus}</Text>
              {audioPlaying && <Text style={styles.audioPlayingBadge}>🔊</Text>}
            </View>
          </View>

          {/* Language selector */}
          <View style={styles.langSelector}>
            <Text style={styles.langLabel}>Language: {getLanguageName(language)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langButtons}>
              {['en', 'hi', 'ta'].map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langBtn, language === lang && styles.langBtnActive]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={[styles.langBtnText, language === lang && styles.langBtnTextActive]}>
                    {getLanguageName(lang)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Messages */}
          <FlatList
            style={styles.list}
            data={messages}
            keyExtractor={item => item.id}
            inverted
            renderItem={({ item }) => (
              <View style={[styles.msgContainer, item.from === 'you' ? styles.userContainer : styles.aiContainer]}>
                <View style={[styles.bubble, item.from === 'you' ? styles.you : styles.ai]}>
                  {item.subtitle && <Text style={styles.msgSubtitle}>{item.subtitle}</Text>}
                  <Text style={styles.msgText}>{item.text}</Text>
                  {item.use_db && <Text style={styles.msgToolTag}>🔧 Database query</Text>}
                </View>
              </View>
            )}
          />

          {/* Recording Status Display */}
          {recording && (
            <View style={styles.recordingStatus}>
              <Text style={styles.recordingText}>🎤 Recording... Speak now</Text>
              <ActivityIndicator size="small" color="#2ee3bb" />
            </View>
          )}

          {/* Input area with Voice & Text options */}
          <View style={styles.inputRow}>
            <View style={styles.inputSection}>
              <TextInput
                placeholder="Type or press 🎤 to speak..."
                style={styles.input}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={send}
                returnKeyType="send"
                placeholderTextColor="rgba(230, 241, 255, 0.45)"
                editable={!loading && !recording}
                multiline
                maxLength={500}
              />
            </View>

            {/* Voice Record Button */}
            <TouchableOpacity
              style={[
                styles.voiceBtn,
                recording && styles.voiceBtnRecording,
                !recordingPermission && styles.voiceBtnDisabled
              ]}
              onPress={recording ? stopRecording : startRecording}
              disabled={!recordingPermission || loading}
            >
              {recording ? (
                <Text style={styles.voiceBtnText}>⏹️</Text>
              ) : (
                <Text style={styles.voiceBtnText}>🎤</Text>
              )}
            </TouchableOpacity>

            {/* Send Button */}
            <TouchableOpacity 
              style={[styles.sendBtn, (loading || recording) && styles.sendBtnDisabled]} 
              onPress={send}
              disabled={loading || recording}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info and back buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.infoBtn} onPress={() => setShowInfo(true)}>
              <Text style={styles.infoBtnText}>ℹ️ About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Info Modal */}
        <Modal visible={showInfo} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalTitle}>About Nalam AI</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Voice + Text Input</Text>
                  {'\n'}Press 🎤 to record voice in English, Hindi, or Tamil. Your speech will be transcribed and processed.
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Multilingual Support</Text>
                  {'\n'}Automatic language detection and persistence throughout your conversation.
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Smart Database Integration</Text>
                  {'\n'}Automatically queries government service databases when needed for:
                  {'\n'}• User context & profiles
                  {'\n'}• Scheme eligibility
                  {'\n'}• Appointment bookings
                  {'\n'}• Certificate fetching
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Powered by</Text>
                  {'\n'}Gemini 2.5 Flash AI with automatic API key failover for reliability.
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Server Status</Text>
                  {'\n'}API: {serverStatus === 'connected' ? '✅ Connected' : '❌ ' + serverStatus}
                </Text>
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowInfo(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  scrim: { flex: 1, backgroundColor: 'rgba(6, 16, 30, 0.30)' },
  
  container: { flex: 1, display: 'flex', flexDirection: 'column' },
  
  // Header
  header: { 
    padding: 16, 
    borderBottomWidth: 1.5, 
    borderBottomColor: 'rgba(46, 227, 187, 0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  title: { fontSize: 24, fontWeight: '900', color: '#2ee3bb', letterSpacing: 1 },
  subtitle: { fontSize: 12, color: '#D8DEEA', marginTop: 4, fontWeight: '600' },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, color: '#D8DEEA', fontWeight: '700', textTransform: 'capitalize' },
  audioPlayingBadge: { fontSize: 14, marginLeft: 8 },

  // Language selector
  langSelector: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(46, 227, 187, 0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  langLabel: { 
    fontSize: 12, 
    color: '#E6F1FF', 
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  langButtons: { flexDirection: 'row', gap: 8 },
  langBtn: { 
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  langBtnActive: { 
    backgroundColor: 'rgba(46, 227, 187, 0.35)',
    borderColor: '#2ee3bb'
  },
  langBtnText: { 
    fontSize: 11, 
    color: '#D8DEEA',
    fontWeight: '700'
  },
  langBtnTextActive: { 
    color: '#FFFFFF',
  },

  // Messages
  list: { flex: 1, paddingHorizontal: 12, paddingVertical: 12 },
  msgContainer: { marginVertical: 6, flexDirection: 'row' },
  userContainer: { justifyContent: 'flex-end' },
  aiContainer: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', padding: 13, borderRadius: 14 },
  you: { 
    backgroundColor: 'rgba(46, 227, 187, 0.28)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.45)',
  },
  ai: { 
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.35)',
  },
  msgText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600', lineHeight: 20 },
  msgSubtitle: { fontSize: 11, color: '#2ee3bb', marginBottom: 6, fontWeight: '700' },
  msgToolTag: { fontSize: 10, color: '#ffac5e', marginTop: 8, fontWeight: '700', fontStyle: 'italic' },

  // Recording Status
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(46, 227, 187, 0.2)',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 227, 187, 0.5)'
  },
  recordingText: {
    fontSize: 13,
    color: '#2ee3bb',
    fontWeight: '700'
  },

  // Input
  inputRow: { 
    flexDirection: 'row', 
    padding: 12, 
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(46, 227, 187, 0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'flex-end',
    gap: 8
  },
  inputSection: {
    flex: 1
  },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(46, 227, 187, 0.55)',
    color: '#FFFFFF',
    fontWeight: '600',
    maxHeight: 100
  },
  
  // Voice Button
  voiceBtn: {
    backgroundColor: 'rgba(46, 227, 187, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.50)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ee3bb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  voiceBtnRecording: {
    backgroundColor: 'rgba(255, 107, 107, 0.35)',
    borderColor: 'rgba(255, 107, 107, 0.50)',
    shadowColor: '#ff6b6b',
  },
  voiceBtnDisabled: {
    opacity: 0.5
  },
  voiceBtnText: {
    fontSize: 16
  },
  // Send Button
  sendBtn: { 
    backgroundColor: 'rgba(46, 227, 187, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.50)',
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ee3bb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },

  // Footer
  footer: { 
    flexDirection: 'row', 
    padding: 12, 
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 227, 187, 0.15)'
  },
  infoBtn: {
    flex: 1,
    backgroundColor: 'rgba(46, 227, 187, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.40)',
    alignItems: 'center',
  },
  infoBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  backBtn: { 
    flex: 1,
    backgroundColor: 'rgba(46, 227, 187, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.40)',
    alignItems: 'center',
    shadowColor: '#2ee3bb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    backgroundColor: 'rgba(10, 16, 28, 0.95)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.35)',
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden'
  },
  modalScroll: { padding: 16, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#2ee3bb', marginBottom: 16, letterSpacing: 0.5 },
  modalText: { fontSize: 13, color: '#D8DEEA', marginBottom: 14, lineHeight: 20, fontWeight: '500' },
  bold: { fontWeight: '800', color: '#FFFFFF' },
  modalClose: {
    backgroundColor: 'rgba(46, 227, 187, 0.35)',
    padding: 13,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 227, 187, 0.20)'
  },
  modalCloseText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 }
});
