import { renderHook, act } from '@testing-library/react-native';
import { useNotificationFrequency } from '../src/hooks/Profile/useNotificationFrequency';
import { userService } from '../src/services/userService';

jest.mock('../src/services/userService', () => ({
  userService: {
    updateNotificationFrequency: jest.fn(),
  },
}));

describe('useNotificationFrequency', () => {
  const baseUser = {
    firstName: 'John',
    email: 'john@example.com',
    targetFixedExpenses: 30,
    targetVariableExpenses: 50,
    targetSavings: 20,
    estimatedMonthlyIncome: 100000,
    onboardingCompleted: true,
    createdAt: '2026-01-01T00:00:00',
    notificationFrequency: 'INSTANT' as const,
  };

  it('persists frequency changes in user state', async () => {
    const setUser = jest.fn();
    (userService.updateNotificationFrequency as jest.Mock).mockResolvedValue({
      ...baseUser,
      notificationFrequency: 'DAILY',
    });

    const { result } = renderHook(() =>
      useNotificationFrequency({
        user: baseUser,
        setUser,
        onSuccess: jest.fn(),
      })
    );

    await act(async () => {
      await result.current.handleSave('DAILY');
    });

    expect(userService.updateNotificationFrequency).toHaveBeenCalledWith('DAILY');
    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({ notificationFrequency: 'DAILY' })
    );
  });
});
