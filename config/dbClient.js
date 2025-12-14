// config/dbClient.js
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

// REPLACE WITH YOUR ACTUAL KEYS
const supabaseUrl = 'postgresql://postgres:admin_nalam@db.apmogbrgeasetudeumdx.supabase.co:5432/postgres' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbW9nYnJnZWFzZXR1ZGV1bWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjIwNTEsImV4cCI6MjA4MTIzODA1MX0.TUgDeQ_UXpnTTdqj2eLXE8QABl3dU9raaX4FNySgaZM' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)