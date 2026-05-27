import { useState } from 'react';
import { userService } from '../../services/userService';
import type { UserProfile } from '../../context/user';

interface Params {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  onSuccess: () => void;
}

export const useExpensesStructure = ({ user, setUser, onSuccess }: Params) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (fixed: number, variable: number, income: number) => {
    if (!user || saving) return;

    setSaving(true);
    setError(null);

    try {
      const [updatedStructure, updatedIncome] = await Promise.all([
        userService.updateExpensesStructure(fixed, variable),
        userService.updateEstimatedMonthlyIncome(income),
      ]);

      setUser({
        ...user,
        targetFixedExpenses: updatedStructure.targetFixedExpenses,
        targetVariableExpenses: updatedStructure.targetVariableExpenses,
        targetSavings: updatedStructure.targetSavings,
        estimatedMonthlyIncome: updatedIncome.estimatedMonthlyIncome,
      });

      onSuccess();

      return updatedStructure;
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
