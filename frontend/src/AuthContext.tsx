import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  saveSettings: (settings: Record<string, any>) => Promise<boolean>;
  loadSettings: () => Promise<Record<string, any> | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.success) {
        const userData: User = {
          id: data.user.id.toString(),
          username: data.user.username,
          name: data.user.name
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, name, password }),
      });

      if (!response.ok) {
        console.error('Register failed with status:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.success) {
        const userData: User = {
          id: data.user.id.toString(),
          username: data.user.username,
          name: data.user.name
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const saveSettings = async (settings: Record<string, any>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Нет токена для сохранения настроек');
        return false;
      }

      const response = await fetch('/api/auth/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();
      return response.ok && data.success;
    } catch (error) {
      console.error('Save settings error:', error);
      return false;
    }
  };

  const loadSettings = async (): Promise<Record<string, any> | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Нет токена для загрузки настроек');
        return null;
      }

      const response = await fetch('/api/auth/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();
      if (response.ok && data.settings) {
        return data.settings;
      }
      return null;
    } catch (error) {
      console.error('Load settings error:', error);
      return null;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    saveSettings,
    loadSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
