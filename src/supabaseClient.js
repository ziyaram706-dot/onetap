
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkilvabzixaijxqrpdnr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raWx2YWJ6aXhhaWp4cXJwZG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjkyOTEsImV4cCI6MjA4NjMwNTI5MX0.R6Z4mlglROxnVJGBVhQ5_C9fx78qAG-nfK8ojyGmPd0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
