import { createContext } from 'react';

export interface UserProfile {
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  targetFixedExpenses: number;
  targetVariableExpenses: number;
  targetSavings: number;
  onboardingCompleted: boolean;
}

export interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
