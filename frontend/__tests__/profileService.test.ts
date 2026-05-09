import { userService } from '../src/services/userService';
import * as authService from '../src/services/authService';

jest.mock('../src/services/authService', () => ({
  authService: {
    getToken: jest.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should call updateProfile endpoint correctly', async () => {
    (authService.authService.getToken as jest.Mock).mockResolvedValue('fake-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ firstName: 'John', lastName: 'Doe' }),
    });

    await userService.updateProfile('John', 'Doe');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/me/profile'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
        }),
      })
    );
  });

  it('should throw error when updateProfile fails', async () => {
    (authService.authService.getToken as jest.Mock).mockResolvedValue('fake-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Update failed' }),
    });

    await expect(userService.updateProfile('John', 'Doe')).rejects.toThrow('Update failed');
  });

  it('should call uploadAvatar endpoint correctly', async () => {
    (authService.authService.getToken as jest.Mock).mockResolvedValue('fake-token');

    const formData = new FormData();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ avatarUrl: 'http://image.com/avatar.png' }),
    });

    await userService.uploadAvatar(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/me/avatar'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-token',
        }),
        body: formData,
      })
    );
  });

  it('should throw error when uploadAvatar fails', async () => {
    (authService.authService.getToken as jest.Mock).mockResolvedValue('fake-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Upload failed' }),
    });

    await expect(userService.uploadAvatar(new FormData())).rejects.toThrow('Upload failed');
  });
});
