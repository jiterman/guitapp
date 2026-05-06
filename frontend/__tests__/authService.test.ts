import { authService } from '../src/services/authService';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should call the register endpoint correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered successfully' }),
    });

    const email = 'test@example.com';
    const password = 'password123';
    await authService.register(email, password);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    );
  });

  it('should call the verify endpoint correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    });

    const email = 'test@example.com';
    const otp = '123456';
    await authService.verifyOtp(email, otp);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/verify-registration'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      })
    );
  });

  it('should call the login endpoint and store token on success', async () => {
    const token = 'fake-jwt-token';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token }),
    });

    const email = 'test@example.com';
    const password = 'password123';
    await authService.login(email, password);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', token);
  });

  it('should get token from SecureStore', async () => {
    const token = 'stored-token';
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(token);

    const result = await authService.getToken();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('userToken');
    expect(result).toBe(token);
  });

  it('should remove token from SecureStore', async () => {
    await authService.removeToken();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
  });

  it('should call forgotPassword endpoint correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    const email = 'test@example.com';
    await authService.forgotPassword(email);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/forgot-password'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    );
  });

  it('should call verifyResetOtp endpoint correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    const email = 'test@example.com';
    const otp = '123456';
    await authService.verifyResetOtp(email, otp);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/verify-reset-otp'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      })
    );
  });

  it('should call resetPassword endpoint correctly and remove biometric user', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    // Mock getBiometricUsers behavior
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([{ email: 'test@example.com' }])
    );

    const email = 'test@example.com';
    const otp = '123456';
    const newPassword = 'newPassword123';
    await authService.resetPassword(email, otp, newPassword);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/reset-password'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      })
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometricUsers', '[]');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('biometric_creds_test_example.com');
  });

  it('should remove biometric user correctly', async () => {
    const email = 'test@example.com';
    // Mock that we have a user in SecureStore
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([{ email, firstName: 'Test' }])
    );

    await authService.removeBiometricUser(email);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometricUsers', '[]');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(`biometric_creds_test_example.com`);
  });
});
