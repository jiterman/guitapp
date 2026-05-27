import React, { useEffect, useState } from 'react';
import { UserContext, UserProfile } from './context';
import { userService } from '../../services/userService';
import { DateTime } from 'luxon';

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
