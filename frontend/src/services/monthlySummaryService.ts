import { authService, API_URL } from './authService';
import type { ExpenseCategory } from '../constants/categories';

export interface MonthlyCategoryBreakdown {
  category: ExpenseCategory;
  totalAmount: number;
  percentage: number;
  changeVsPreviousMonth: number | null;
}

export interface MonthlyInsight {
  type:
    | 'EXPENSES_VS_PREV_MONTH'
    | 'SAVINGS'
    | 'TOP_CATEGORY'
    | 'CATEGORY_INCREASE'
    | 'CATEGORY_DECREASE'
    | 'NON_ESSENTIAL_RATIO';
  label: string;
  highlight: string;
  sub: string;
  variant: 'positive' | 'negative' | 'neutral';
  category: string | null;
}

export interface MonthlySummaryResponse {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: MonthlyCategoryBreakdown[];
  insights: MonthlyInsight[];
}

const getMonthlySummary = async (year: number, month: number): Promise<MonthlySummaryResponse> => {
  const token = await authService.getToken();
  const params = new URLSearchParams({ year: year.toString(), month: month.toString() });

  const response = await fetch(`${API_URL}/api/summary/monthly?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get monthly summary failed' };
  }

  return response.json();
};

export const monthlySummaryService = {
  getMonthlySummary,
};
