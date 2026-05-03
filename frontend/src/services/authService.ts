import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Define a custom error type to include the code
interface BackendError extends Error {
  code?: string;
}

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_ENV === 'prod') {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  if (__DEV__) {
    const debuggerHost = Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const localIp = debuggerHost.split(':')[0];
      return `http://${localIp}:8080`;
    }
  }
  return process.env.EXPO_PUBLIC_BACKEND_URL;
};

export const API_URL = getApiUrl();

export const authService = {
  register: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorToThrow: BackendError = new Error(errorData.message || 'Registration failed');
        if (errorData.code) {
          errorToThrow.code = errorData.code;
        }
        throw errorToThrow;
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await fetch(`${API_URL}/api/auth/verify-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorToThrow: BackendError = new Error(errorData.message || 'OTP verification failed');
      if (errorData.code) {
        errorToThrow.code = errorData.code;
      }
      throw errorToThrow;
    }

    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorToThrow: BackendError = new Error(errorData.message || 'Login failed');
      if (errorData.code) {
        errorToThrow.code = errorData.code;
      }
      throw errorToThrow;
    }

    const data = await response.json();
    if (data.token) {
      await SecureStore.setItemAsync('userToken', data.token);
    }
    return data;
  },

  getToken: async () => {
    return await SecureStore.getItemAsync('userToken');
  },

  removeToken: async () => {
    await SecureStore.deleteItemAsync('userToken');
  },
};
