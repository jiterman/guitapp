import {
  expenseStatisticsService,
  ExpenseStatisticsParams,
} from '../src/services/expenseStatisticsService';
import { authService } from '../src/services/authService';

jest.mock('../src/services/authService');

global.fetch = jest.fn();

describe('expenseStatisticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExpenseStatistics', () => {
    it('should fetch statistics with period only', async () => {
      const mockToken = 'mock-token';
      const mockResponse = {
        totalAmount: 1000,
        categories: [
          {
            category: 'RESTAURANT',
            totalAmount: 500,
            count: 5,
            percentage: 50,
          },
        ],
      };

      (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const params: ExpenseStatisticsParams = { period: 'monthly' };
      const result = await expenseStatisticsService.getExpenseStatistics(params);

      expect(authService.getToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/expenses/statistics?period=monthly'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch statistics with year and month', async () => {
      const mockToken = 'mock-token';
      const mockResponse = {
        totalAmount: 500,
        categories: [],
      };

      (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const params: ExpenseStatisticsParams = {
        period: 'monthly',
        year: 2024,
        month: 5,
      };
      const result = await expenseStatisticsService.getExpenseStatistics(params);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=monthly'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('month=5'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch statistics with year, month and day', async () => {
      const mockToken = 'mock-token';
      const mockResponse = {
        totalAmount: 100,
        categories: [],
      };

      (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const params: ExpenseStatisticsParams = {
        period: 'daily',
        year: 2024,
        month: 5,
        day: 15,
      };
      const result = await expenseStatisticsService.getExpenseStatistics(params);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('period=daily'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('month=5'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('day=15'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when response is not ok', async () => {
      const mockToken = 'mock-token';
      const mockError = {
        code: 'ERROR_CODE',
        message: 'Error message',
      };

      (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue(mockError),
      });

      const params: ExpenseStatisticsParams = { period: 'all' };

      await expect(expenseStatisticsService.getExpenseStatistics(params)).rejects.toEqual({
        code: 'ERROR_CODE',
        message: 'Error message',
      });
    });

    it('should throw default error when response has no error details', async () => {
      const mockToken = 'mock-token';

      (authService.getToken as jest.Mock).mockResolvedValue(mockToken);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockRejectedValue(new Error('Parse error')),
      });

      const params: ExpenseStatisticsParams = { period: 'monthly' };

      await expect(expenseStatisticsService.getExpenseStatistics(params)).rejects.toEqual({
        code: undefined,
        message: 'Get statistics failed',
      });
    });
  });
});
