import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';
import { AppContext } from './AppContextObject';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role: string;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isSpanish, setIsSpanish] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser.role) {
        throw new Error('Invalid user data');
      }

      setToken(savedToken);
      setUser(parsedUser as User);
    } catch (error) {
      console.error('Failed to restore auth state:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.removeItem('role');

    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isSpanish,
        setIsSpanish,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};