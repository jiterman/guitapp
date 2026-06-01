import { monthlySummaryService } from '../src/services/monthlySummaryService';
import { authService } from '../src/services/authService';

jest.mock('../src/services/authService');

global.fetch = jest.fn();

describe('monthlySummaryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the correct endpoint with year and month params', async () => {
    const mockToken = 'test-token';
    const mockResponse = {
      year: 2025,
      month: 4,
      totalIncome: 3000,
      totalExpenses: 1500,
      balance: 1500,
      categoryBreakdown: [],
      insights: [],
    };

    (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await monthlySummaryService.getMonthlySummary(2025, 4);

    expect(authService.getToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/summary/monthly?year=2025&month=4'),
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: `Bearer ${mockToken}` },
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('throws error object when response is not ok', async () => {
    (authService.getToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ code: 'NOT_FOUND', message: 'User not found' }),
    });

    await expect(monthlySummaryService.getMonthlySummary(2025, 4)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'User not found',
    });
  });

  it('uses fallback message when error body is empty', async () => {
    (authService.getToken as jest.Mock).mockResolvedValue('token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('parse error')),
    });

    await expect(monthlySummaryService.getMonthlySummary(2025, 4)).rejects.toMatchObject({
      message: 'Get monthly summary failed',
    });
  });
});
