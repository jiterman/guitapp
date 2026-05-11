import { API_URL, authService } from './authService';

export const userService = {
  getProfile: async () => {
    const token = await authService.getToken();
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
    targetVariableExpenses: number
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

    const response = await fetch(`${API_URL}/api/users/me/email/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        newEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al iniciar cambio de email');
    }

    return response.json();
  },

  verifyEmailChange: async (otp: string) => {
    const token = await authService.getToken();

    const response = await fetch(`${API_URL}/api/users/me/email/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        otp,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al verificar OTP');
    }

    return response.json();
  },
};
