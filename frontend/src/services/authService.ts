import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

interface BackendError extends Error {
  code?: string;
}

export interface BiometricUser {
  email: string;
  firstName?: string;
}

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_ENV === 'prod') {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  if (__DEV__) {
    const hostUri = Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;
    if (hostUri) {
      return `http://${hostUri.split(':')[0]}:8080`;
    }
  }
  return process.env.EXPO_PUBLIC_BACKEND_URL;
};

export const API_URL = getApiUrl();

export const authService = {
  tempPassword: null as string | null,
  setTempPassword: (password: string) => {
    authService.tempPassword = password;
  },
  getTempPassword: () => {
    return authService.tempPassword;
  },
  clearTempPassword: () => {
    authService.tempPassword = null;
  },
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

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorToThrow: BackendError = new Error(
        errorData.message || 'Forgot password request failed'
      );
      if (errorData.code) {
        errorToThrow.code = errorData.code;
      }
      throw errorToThrow;
    }

    return response.json();
  },

  verifyResetOtp: async (email: string, otp: string) => {
    const response = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
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

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorToThrow: BackendError = new Error(errorData.message || 'Password reset failed');
      if (errorData.code) {
        errorToThrow.code = errorData.code;
      }
      throw errorToThrow;
    }

    await authService.removeBiometricUser(email);

    return response.json();
  },

  getToken: async () => {
    return await SecureStore.getItemAsync('userToken');
  },

  removeToken: async () => {
    await SecureStore.deleteItemAsync('userToken');
  },

  isBiometricAvailable: async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    return LocalAuthentication.isEnrolledAsync();
  },

  authenticateWithBiometrics: async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Ingresá a Guitapp',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
    });
    return result.success;
  },

  getBiometricUsers: async (): Promise<BiometricUser[]> => {
    const raw = await SecureStore.getItemAsync('biometricUsers');
    if (!raw) return [];

    let users: BiometricUser[] = [];
    try {
      users = JSON.parse(raw);
    } catch {
      return [];
    }

    const valid: BiometricUser[] = [];
    for (const user of users) {
      const key = `biometric_creds_${user.email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const creds = await SecureStore.getItemAsync(key);
      if (creds) valid.push(user);
    }
    if (valid.length !== users.length) {
      await SecureStore.setItemAsync('biometricUsers', JSON.stringify(valid));
    }
    return valid;
  },

  addBiometricUser: async (email: string, password: string, firstName?: string) => {
    const users = await authService.getBiometricUsers();
    const filtered = users.filter(u => u.email !== email);
    const updated: BiometricUser[] = [...filtered, { email, firstName }];
    await SecureStore.setItemAsync('biometricUsers', JSON.stringify(updated));
    const key = `biometric_creds_${email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await SecureStore.setItemAsync(key, JSON.stringify({ email, password }));
  },

  updateBiometricUserName: async (email: string, firstName: string) => {
    const users = await authService.getBiometricUsers();
    const updated = users.map(u => (u.email === email ? { ...u, firstName } : u));
    await SecureStore.setItemAsync('biometricUsers', JSON.stringify(updated));
  },

  getBiometricCredentials: async (
    email: string
  ): Promise<{ email: string; password: string } | null> => {
    const key = `biometric_creds_${email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const raw = await SecureStore.getItemAsync(key);
    return raw ? JSON.parse(raw) : null;
  },

  removeBiometricUser: async (email: string) => {
    const users = await authService.getBiometricUsers();
    const filtered = users.filter(u => u.email !== email);
    await SecureStore.setItemAsync('biometricUsers', JSON.stringify(filtered));
    const key = `biometric_creds_${email.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await SecureStore.deleteItemAsync(key);
  },
};
