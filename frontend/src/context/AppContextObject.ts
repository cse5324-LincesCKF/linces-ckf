import { createContext } from 'react';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role: string;
}

export interface AppContextType {
  isSpanish: boolean;
  setIsSpanish: (val: boolean) => void;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);