import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  activeUsername: string | null;
  setActiveUsername: (username: string | null) => void;
  login: (email: string, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUsername, setActiveUsernameState] = useState<string | null>(localStorage.getItem('gitintel_active_user'));

  const setActiveUsername = (username: string | null) => {
    if (username) {
      localStorage.setItem('gitintel_active_user', username);
    } else {
      localStorage.removeItem('gitintel_active_user');
    }
    setActiveUsernameState(username);
  };

  return (
    <AuthContext.Provider
      value={{
        token: null,
        email: 'Public Session',
        isAuthenticated: true,
        activeUsername,
        setActiveUsername,
        login: () => {},
        logout: () => {}
      }}
    >
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
