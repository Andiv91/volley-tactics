import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role?: UserRole }) => Promise<void>;
  googleAuth: (payload: { credential?: string; demoUser?: any }) => Promise<void>;
  logout: () => void;
  quickLoginDemo: (role: 'ADMIN' | 'USER') => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('volei_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('volei_token');
      if (storedToken) {
        try {
          const { user: fetchedUser } = await api.getMe();
          setUser(fetchedUser);
        } catch (err) {
          console.warn('Sesión expirada o token inválido:', err);
          localStorage.removeItem('volei_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      localStorage.setItem('volei_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name: string; role?: UserRole }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('volei_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async (payload: { credential?: string; demoUser?: any }) => {
    setIsLoading(true);
    try {
      const res = await api.googleAuth(payload);
      localStorage.setItem('volei_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('volei_token');
    setToken(null);
    setUser(null);
  };

  const quickLoginDemo = async (role: 'ADMIN' | 'USER') => {
    if (role === 'ADMIN') {
      await login({ email: 'admin@volleyball.edu', password: 'Admin123!' });
    } else {
      await login({ email: 'athlete@volleyball.edu', password: 'User123!' });
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    const res = await api.updateAvatar(avatarUrl);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        googleAuth,
        logout,
        quickLoginDemo,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
