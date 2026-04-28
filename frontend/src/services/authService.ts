const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

export const authService = {
  register: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },

  verifyOtp: async (email, otp) => {
    const response = await fetch(`${API_URL}/auth/verify-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'OTP verification failed');
    }

    return response.json();
  },
};
