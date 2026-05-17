import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { DateTime } from 'luxon';

export interface UserProfile {
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  targetFixedExpenses: number;
  targetVariableExpenses: number;
  targetSavings: number;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  getCreatedMonth: () => string;
  getCreatedYear: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const getCreatedMonth = (): string => {
    const date = user?.createdAt ? DateTime.fromISO(user.createdAt) : DateTime.now();
    return date.setLocale('es').toFormat('MMMM').toLowerCase();
  };

  const getCreatedYear = (): string => {
    const date = user?.createdAt ? DateTime.fromISO(user.createdAt) : DateTime.now();

    return date.toFormat('yyyy'); // "2026"
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        getCreatedMonth,
        getCreatedYear,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
