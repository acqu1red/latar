import { createClient } from '@supabase/supabase-js';

// Замените эти значения на ваши данные Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://onohxfxrbgaeziutjwtm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub2h4ZnhyYmdhZXppdXRqd3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njg5NzcsImV4cCI6MjA3NDU0NDk3N30.SIcdicX79Br9mvlF3N-EAY8DYtVjj48woweCEk-PBVY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
