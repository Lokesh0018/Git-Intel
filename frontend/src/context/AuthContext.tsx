import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('gitintel_token'));
  const [email, setEmail] = useState<string | null>(localStorage.getItem('gitintel_email'));

  const login = (userEmail: string, userToken: string) => {
    localStorage.setItem('gitintel_token', userToken);
    localStorage.setItem('gitintel_email', userEmail);
    setToken(userToken);
    setEmail(userEmail);
  };

  const logout = () => {
    localStorage.removeItem('gitintel_token');
    localStorage.removeItem('gitintel_email');
    setToken(null);
    setEmail(null);
  };

  // Synchronize state across tabs if local storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('gitintel_token'));
      setEmail(localStorage.getItem('gitintel_email'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ token, email, isAuthenticated: !!token, login, logout }}>
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
