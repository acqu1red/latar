// Конфигурация API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://latar-backend.onrender.com' 
  : 'http://localhost:3001';

// Supabase Configuration
export const SUPABASE_URL = 'https://onohxfxrbgaeziutjwtm.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub2h4ZnhyYmdhZXppdXRqd3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njg5NzcsImV4cCI6MjA3NDU0NDk3N30.SIcdicX79Br9mvlF3N-EAY8DYtVjj48woweCEk-PBVY';
