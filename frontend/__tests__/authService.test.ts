import { authService } from '../src/services/authService';

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
});
