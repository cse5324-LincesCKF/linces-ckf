import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  token: string;
  role: string;
}

interface AppContextType {
  isSpanish: boolean;
  setIsSpanish: (val: boolean) => void;
  user: User | null;
  login: (token: string, role: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isSpanish, setIsSpanish] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (savedToken && savedRole) {
      setUser({ token: savedToken, role: savedRole });
    }
  }, []);

  const login = (token: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ token, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ isSpanish, setIsSpanish, user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};