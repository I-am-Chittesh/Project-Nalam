// client/config/dbClient.js
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

// 1. URL: Must start with "https://" (Find this in Settings > API)
const supabaseUrl = 'https://apmogbrgeasetudeumdx.supabase.co' 

// 2. KEY: Must be the "anon" / "public" key (Find this in Settings > API)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbW9nYnJnZWFzZXR1ZGV1bWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjIwNTEsImV4cCI6MjA4MTIzODA1MX0.TUgDeQ_UXpnTTdqj2eLXE8QABl3dU9raaX4FNySgaZM' 

export const supabase = createClient(supabaseUrl, supabaseKey)