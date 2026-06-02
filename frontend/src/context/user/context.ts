import { createContext } from 'react';

export type NotificationChannel = 'EMAIL' | 'PUSH';

export type NotificationFrequency = 'INSTANT' | 'DAILY' | 'WEEKLY';

export interface UserProfile {
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  targetFixedExpenses: number;
  targetVariableExpenses: number;
  targetSavings: number;
  estimatedMonthlyIncome: number;
  onboardingCompleted: boolean;
  notificationChannel?: NotificationChannel;
  notificationFrequency?: NotificationFrequency;
  createdAt: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
  getCreatedMonth: () => string;
  getCreatedYear: () => string;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
