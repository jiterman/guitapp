import { API_URL, authService } from './authService';

export const userService = {
  getProfile: async () => {
    const token = await authService.getToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener perfil del usuario: ${response.status}`);
    }

    return response.json();
  },

  completeOnboarding: async (
    firstName: string,
    targetFixedExpenses: number,
    targetVariableExpenses: number,
    estimatedMonthlyIncome: number
  ) => {
    const token = await authService.getToken();
    const response = await fetch(`${API_URL}/api/users/me/onboarding`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName,
        targetFixedExpenses,
        targetVariableExpenses,
        estimatedMonthlyIncome,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to complete onboarding');
    }

    return response.json();
  },

  updateProfile: async (firstName: string, lastName?: string) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName,
        lastName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error updating profile');
    }

    return response.json();
  },

  uploadAvatar: async (formData: FormData) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error uploading avatar');
    }

    return response.json();
  },

  initiateEmailChange: async (newEmail: string) => {
    const token = await authService.getToken();

    try {
      const response = await fetch(`${API_URL}/api/users/me/email/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Error al iniciar cambio de email');
      }

      return data;
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'Network request failed'
          ? 'No se pudo conectar al servidor. Intentá nuevamente'
          : error instanceof Error
            ? error.message
            : 'Error de conexión. Intentá nuevamente';

      throw new Error(message);
    }
  },

  verifyEmailChange: async (otp: string) => {
    const token = await authService.getToken();

    try {
      const response = await fetch(`${API_URL}/api/users/me/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Error al verificar OTP');
      }

      return data;
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'Network request failed'
          ? 'No se pudo conectar al servidor. Intentá nuevamente'
          : error instanceof Error
            ? error.message
            : 'Error de conexión. Intentá nuevamente';

      throw new Error(message);
    }
  },

  initiatePasswordChange: async (currentPassword: string, newPassword: string) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/password/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || 'Error al iniciar cambio de contraseña');
    }

    return data;
  },

  confirmPasswordChange: async (confirmed: boolean) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/password/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        confirmed,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al confirmar cambio de contraseña');
    }

    return response.json();
  },

  updateFcmToken: async (fcmToken: string) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/fcm-token`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fcmToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar FCM token');
    }

    return response.json();
  },

  updateNotificationChannel: async (notificationChannel: 'EMAIL' | 'PUSH') => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/notification-channel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notificationChannel }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar el canal de notificaciones');
    }

    return data;
  },

  updateEstimatedMonthlyIncome: async (estimatedMonthlyIncome: number) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/estimated-monthly-income`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estimatedMonthlyIncome }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar los ingresos estimados');
    }

    return data.data;
  },

  updateExpensesStructure: async (targetFixedExpenses: number, targetVariableExpenses: number) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/expenses-structure`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        targetFixedExpenses,
        targetVariableExpenses,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar la estructura de gastos');
    }

    return data.data;
  },
};
