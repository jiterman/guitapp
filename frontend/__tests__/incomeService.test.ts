import { incomeService, IncomeStatisticsParams } from '../src/services/incomeService';
import { authService } from '../src/services/authService';

jest.mock('../src/services/authService');

global.fetch = jest.fn();

describe('incomeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIncomeStatistics', () => {
    it('should fetch income statistics with period only', async () => {
      const mockToken = 'mock-token';
      const mockResponse = { totalAmount: 1200 };

      (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const params: IncomeStatisticsParams = { period: 'monthly' };
      const result = await incomeService.getIncomeStatistics(params);

      expect(authService.getToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/incomes/statistics?period=monthly'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when response is not ok', async () => {
      const mockToken = 'mock-token';
      const mockError = { code: 'ERROR_CODE', message: 'Error message' };

      (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue(mockError),
      });

      const params: IncomeStatisticsParams = { period: 'all' };

      await expect(incomeService.getIncomeStatistics(params)).rejects.toEqual({
        code: 'ERROR_CODE',
        message: 'Error message',
      });
    });
  });
});
