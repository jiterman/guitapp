import { useState } from 'react';
import { router } from 'expo-router';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import type { UserProfile } from '../../context/UserContext';

interface UsePersonalInfoParams {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  onSuccess: () => void;
}

export const usePersonalInfo = ({ user, setUser, onSuccess }: UsePersonalInfoParams) => {
  const [saving, setSaving] = useState(false);

  const handleSaveName = async (newFirst: string, newLast: string) => {
    if (saving || !user) return;
    setSaving(true);
    try {
      const updatedProfile = await userService.updateProfile(newFirst, newLast);
      if (user.email) {
        await authService.updateBiometricUserName(user.email, updatedProfile.firstName);
      }
      setUser({
        ...user,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        onboardingCompleted: true,
      });
      onSuccess();
    } catch (e) {
      console.error('Error actualizando perfil', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async (newEmail: string) => {
    if (saving || !user) return;
    setSaving(true);
    try {
      await userService.initiateEmailChange(newEmail);
      onSuccess();
      router.push({
        pathname: '/verify-email-change',
        params: { email: newEmail },
      });
    } catch (e) {
      console.error('Error iniciando cambio de email', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    handleSaveName,
    handleSaveEmail,
  };
};
