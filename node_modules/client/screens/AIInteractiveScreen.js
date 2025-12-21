import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';

export default function AIInteractiveScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', from: 'ai', text: 'Welcome — try typing a message and press Send.' }
  ]);

  function send() {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), from: 'you', text: input };
    setMessages(prev => [userMsg, ...prev]);

    // Simple local 'AI' response to keep this deployable offline.
    const aiReply = { id: (Date.now()+1).toString(), from: 'ai', text: `Echo: ${input}` };
    setTimeout(() => setMessages(prev => [aiReply, ...prev]), 500);
    setInput('');
  }

  return (
    <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.bgImage}
        blurRadius={26}
    >
      <View style={styles.scrim}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Interactive Page</Text>
        <Text style={styles.subtitle}>A simple deployable interactive UI (local echo bot)</Text>
      </View>

      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={item => item.id}
        inverted
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === 'you' ? styles.you : styles.ai]}>
            <Text style={styles.msgText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          placeholderTextColor="rgba(230, 241, 255, 0.45)"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Back to Dashboard</Text>
      </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  scrim: { flex: 1, backgroundColor: 'rgba(6, 16, 30, 0.30)' },
  
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1.5, borderBottomColor: 'rgba(46, 227, 187, 0.25)', marginTop: 8 },
  title: { fontSize: 28, fontWeight: '900', color: '#F0F4FF', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#D8DEEA', marginTop: 6, fontWeight: '600' },
  
  list: { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
  bubble: { marginVertical: 8, padding: 13, borderRadius: 14, maxWidth: '85%' },
  you: { 
    backgroundColor: 'rgba(46, 227, 187, 0.28)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.45)',
    alignSelf: 'flex-end',
  },
  ai: { 
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.35)',
  },
  msgText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  
  inputRow: { 
    flexDirection: 'row', 
    padding: 12, 
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(46, 227, 187, 0.25)',
    alignItems: 'center',
  },
  input: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: 13,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(46, 227, 187, 0.55)',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sendBtn: { 
    marginLeft: 10,
    backgroundColor: 'rgba(46, 227, 187, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.50)',
    shadowColor: '#2ee3bb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  sendText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  
  backBtn: { 
    backgroundColor: 'rgba(46, 227, 187, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 227, 187, 0.50)',
    alignItems: 'center',
    shadowColor: '#2ee3bb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.6 },
});
