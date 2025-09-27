import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Проверяем текущую сессию при загрузке
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
