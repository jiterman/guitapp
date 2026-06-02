import { useState } from 'react';
import { userService } from '../../services/userService';
import type { NotificationFrequency, UserProfile } from '../../context/user';

interface Params {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  onSuccess: () => void;
}

export const useNotificationFrequency = ({ user, setUser, onSuccess }: Params) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (frequency: NotificationFrequency) => {
    if (!user || saving) return null;

    setSaving(true);
    setError(null);

    try {
      const updated = await userService.updateNotificationFrequency(frequency);

      setUser({
        ...user,
        notificationFrequency: updated.notificationFrequency ?? frequency,
      });

      onSuccess();

      return updated;
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);

      let message = raw;
      if (raw.toLowerCase().includes('network request failed')) {
        message = 'Parece que hay un problema de conexión. Intentá nuevamente más tarde.';
      }

      setError(message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => setError(null);

  return {
    saving,
    error,
    handleSave,
    clearError,
  };
};
