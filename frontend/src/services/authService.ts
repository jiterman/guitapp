import Constants from 'expo-constants';

// Define a custom error type to include the code
interface BackendError extends Error {
  code?: string;
}

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_ENV === 'prod') {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const localIp = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${localIp}:8080`;
  }
  return process.env.EXPO_PUBLIC_BACKEND_URL;
};

export const API_URL = getApiUrl();

export const authService = {
  register: async (email, password) => {
    console.log("1. URL a la que le pego:", API_URL);

    try {
      console.log("2. Iniciando fetch...");
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("3. ¡El fetch terminó! La respuesta es:", response.status);

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
      // Si el fetch explota por red, va a caer directo acá
      console.log("🚨 ERROR FATAL DE RED:", (error as Error).message);
      console.log("Detalle completo:", error);
      throw error; // Volvemos a lanzar el error por si la UI lo necesita
    }
  },

  verifyOtp: async (email, otp) => {
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
};
