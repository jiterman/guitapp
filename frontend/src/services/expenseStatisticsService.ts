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

export interface ExpenseStatisticsParams {
  period: PeriodType;
  year?: number;
  month?: number;
  day?: number;
}

const getExpenseStatistics = async (
  params: ExpenseStatisticsParams
): Promise<ExpenseStatisticsResponse> => {
  const token = await authService.getToken();
  const queryParams = new URLSearchParams({ period: params.period });

  if (params.year !== undefined) {
    queryParams.append('year', params.year.toString());
  }
  if (params.month !== undefined) {
    queryParams.append('month', params.month.toString());
  }
  if (params.day !== undefined) {
    queryParams.append('day', params.day.toString());
  }

  const response = await fetch(`${API_URL}/api/expenses/statistics?${queryParams.toString()}`, {
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
