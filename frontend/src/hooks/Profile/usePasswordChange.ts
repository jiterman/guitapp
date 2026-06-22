import { useState } from 'react';
import { router } from 'expo-router';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { useDialog } from '../../context/dialog';

interface UsePasswordChangeParams {
  onSuccess: () => void;
  setUser: (user: null) => void;
}

export const usePasswordChange = ({ onSuccess, setUser }: UsePasswordChangeParams) => {
  const [saving, setSaving] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { alert } = useDialog();

  const handleSavePassword = async (currentPassword: string, newPassword: string) => {
    if (saving) return;

    setSaving(true);
    setPasswordError(null);
    try {
      await userService.initiatePasswordChange(currentPassword, newPassword);
      setConfirmVisible(true);
    } catch (e) {
      const rawMessage = e instanceof Error ? e.message : String(e);
      let message = rawMessage;
      if (rawMessage.toLowerCase().includes('network request failed')) {
        message = 'Parece que hay un problema de conexión. Intentá nuevamente más tarde.';
      }
      setPasswordError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPasswordChange = async (confirmed: boolean) => {
    setConfirmLoading(true);
    setConfirmError(null);

    try {
      await userService.confirmPasswordChange(confirmed);

      if (confirmed) {
        onSuccess();
        setConfirmError(null);

        await authService.removeToken();
        setUser(null);
        await alert({ title: 'Listo', message: 'Contraseña cambiada con éxito' });
        router.replace('/login');
      } else {
        setConfirmVisible(false);
      }
    } catch (e) {
      if (confirmed) {
        const rawMessage = e instanceof Error ? e.message : String(e);
        let message = rawMessage;
        if (rawMessage.toLowerCase().includes('network request failed')) {
          message = 'Parece que hay un problema de conexión. Intentá nuevamente más tarde.';
        }
        setPasswordError(message);
      }
    } finally {
      setConfirmVisible(false);
      setConfirmLoading(false);
    }
  };

  const handlePasswordInputChange = () => {
    if (passwordError) setPasswordError(null);
  };

  return {
    saving,
    passwordError,
    confirmVisible,
    confirmLoading,
    confirmError,
    handleSavePassword,
    handleConfirmPasswordChange,
    handlePasswordInputChange,
  };
};
