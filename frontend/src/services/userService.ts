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
      throw new Error('Failed to fetch user profile');
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
};
