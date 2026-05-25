import { useState } from 'react';
import { userService } from '../../services/userService';
import type { UserProfile } from '../../context/UserContext';

interface Params {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  onSuccess: () => void;
}

export const useExpensesStructure = ({ user, setUser, onSuccess }: Params) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (fixed: number, variable: number) => {
    if (!user || saving) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await userService.updateExpensesStructure(fixed, variable);

      setUser({
        ...user,
        targetFixedExpenses: updated.targetFixedExpenses,
        targetVariableExpenses: updated.targetVariableExpenses,
        targetSavings: updated.targetSavings,
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

  const handleInputChange = () => {
    if (error) setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    saving,
    error,
    handleSave,
    handleInputChange,
    clearError,
  };
};
