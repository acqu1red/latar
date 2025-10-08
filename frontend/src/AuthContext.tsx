import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  accessPrefix: string | null;
  plansUsed: number;
  regenerationsUsed: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  saveSettings: (settings: Record<string, any>) => Promise<boolean>;
  loadSettings: () => Promise<Record<string, any> | null>;
  refreshUser: () => Promise<void>;
  grantOrganizationAccess: (username: string) => Promise<{ success: boolean; error?: string }>;
  fetchOrganizationUsers: () => Promise<User[] | null>;
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
      try {
        const parsed = JSON.parse(savedUser);
        const normalized: User = {
          id: parsed.id?.toString() || '0',
          username: parsed.username,
          name: parsed.name,
          role: parsed.role || 'user',
          accessPrefix: parsed.accessPrefix ?? null,
          plansUsed: parsed.plansUsed ?? 0,
          regenerationsUsed: parsed.regenerationsUsed ?? 0
        };
        setUser(normalized);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('user');
      }
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
          name: data.user.name,
          role: data.user.role,
          accessPrefix: data.user.accessPrefix,
          plansUsed: data.user.plansUsed ?? 0,
          regenerationsUsed: data.user.regenerationsUsed ?? 0
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', userData.id);
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
          name: data.user.name,
          role: data.user.role,
          accessPrefix: data.user.accessPrefix,
          plansUsed: data.user.plansUsed ?? 0,
          regenerationsUsed: data.user.regenerationsUsed ?? 0
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', userData.id);
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

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }, []);

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

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        return;
      }

      const data = await response.json();
      if (data.user) {
        const refreshedUser: User = {
          id: data.user.id.toString(),
          username: data.user.username,
          name: data.user.name,
          role: data.user.role,
          accessPrefix: data.user.accessPrefix,
          plansUsed: data.user.plansUsed ?? 0,
          regenerationsUsed: data.user.regenerationsUsed ?? 0
        };
        setUser(refreshedUser);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
        localStorage.setItem('userId', refreshedUser.id);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, [logout]);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      refreshUser();
    }
  }, [refreshUser]);

  const grantOrganizationAccess = async (username: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Необходима авторизация' };
      }

      const response = await fetch('/api/auth/grant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Не удалось выдать доступ' };
      }

      return { success: true };
    } catch (error) {
      console.error('Grant access error:', error);
      return { success: false, error: 'Ошибка сервера' };
    }
  };

  const fetchOrganizationUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      const response = await fetch('/api/auth/organizations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (Array.isArray(data.users)) {
        return data.users.map((u: any) => ({
          id: u.id.toString(),
          username: u.username,
          name: u.name,
          role: u.role,
          accessPrefix: u.accessPrefix,
          plansUsed: u.plansUsed ?? 0,
          regenerationsUsed: u.regenerationsUsed ?? 0
        }));
      }
      return null;
    } catch (error) {
      console.error('Fetch organizations error:', error);
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
    loadSettings,
    refreshUser,
    grantOrganizationAccess,
    fetchOrganizationUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
