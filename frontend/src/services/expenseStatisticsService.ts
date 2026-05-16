import { authService, API_URL } from './authService';
import { ExpenseCategory } from './expenseService';

export interface ExpenseCategoryStatistics {
  category: ExpenseCategory;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface ExpenseStatisticsResponse {
  totalAmount: number;
  categories: ExpenseCategoryStatistics[];
}

export type PeriodType = 'all' | 'monthly' | 'daily';

const getExpenseStatistics = async (period: PeriodType): Promise<ExpenseStatisticsResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/expenses/statistics?period=${period}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get statistics failed' };
  }

  return response.json();
};

export const expenseStatisticsService = {
  getExpenseStatistics,
};
