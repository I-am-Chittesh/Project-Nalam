import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function AIInteractiveScreen() {
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
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fb' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '600' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  list: { flex: 1, paddingHorizontal: 12 },
  bubble: { marginVertical: 6, padding: 12, borderRadius: 12, maxWidth: '85%' },
  you: { backgroundColor: '#d1f0ff', alignSelf: 'flex-end' },
  ai: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#eee' },
  msgText: { fontSize: 14 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e6e6e6' },
  sendBtn: { marginLeft: 8, backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  sendText: { color: '#fff', fontWeight: '600' },
});
