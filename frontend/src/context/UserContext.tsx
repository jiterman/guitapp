import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';

export interface UserProfile {
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  targetFixedExpenses: number;
  targetVariableExpenses: number;
  targetSavings: number;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile);
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
