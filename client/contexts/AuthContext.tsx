'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { AuthUser } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Função para obter o usuário do localStorage
  const getUser = (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userId');

      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        return {
          id: parsedUserData.id,
          token: token,
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      // Limpar dados corrompidos
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      return null;
    }
  };

  // Função para verificar se está autenticado
  const getIsAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userId');
    return !!(token && userData);
  };

  useEffect(() => {
    // Apenas definir isLoading como false após verificar localStorage
    setIsLoading(false);
  }, []);

  const login = (userData: AuthUser, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  };

  const value: AuthContextType = {
    user: getUser(),
    isAuthenticated: getIsAuthenticated(),
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
