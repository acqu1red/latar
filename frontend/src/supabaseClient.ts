import { createClient } from '@supabase/supabase-js';

// Замените эти значения на ваши данные Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Проверяем, настроены ли переменные окружения
const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Экспортируем флаг для проверки в компонентах
export const isSupabaseEnabled = isSupabaseConfigured;
