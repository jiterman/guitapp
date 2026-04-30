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
});
