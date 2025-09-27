import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://onohxfxrbgaeziutjwtm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub2h4ZnhyYmdhZXppdXRqd3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njg5NzcsImV4cCI6MjA3NDU0NDk3N30.SIcdicX79Br9mvlF3N-EAY8DYtVjj48woweCEk-PBVY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth types
export interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

// Auth functions
export const authService = {
  // Register with username and password
  async register(username: string, password: string, displayName?: string): Promise<AuthResponse> {
    try {
      // Hash password on client side (in production, this should be done on server)
      const { error } = await supabase.auth.signUp({
        email: `${username}@latar.local`, // Dummy email for Supabase auth
        password: password,
        options: {
          data: {
            username: username,
            display_name: displayName || username
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Create user record in our custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          username: username,
          password_hash: password, // In production, hash this properly
          display_name: displayName || username
        })
        .select()
        .single();

      if (userError) {
        return { user: null, error: userError.message };
      }

      return { user: userData, error: null };
    } catch (err) {
      return { user: null, error: 'Произошла ошибка при регистрации' };
    }
  },

  // Login with username and password
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      // First, find user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        return { user: null, error: 'Пользователь не найден' };
      }

      // Simple password check (in production, use proper hashing)
      if (userData.password_hash !== password) {
        return { user: null, error: 'Неверный пароль' };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      return { user: userData, error: null };
    } catch (err) {
      return { user: null, error: 'Произошла ошибка при входе' };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return userData;
    } catch (err) {
      return null;
    }
  },

  // Logout
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
};
