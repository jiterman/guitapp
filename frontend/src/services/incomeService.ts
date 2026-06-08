import { authService, API_URL } from './authService';
import type { IncomeCategory } from '../constants/categories';

export interface AddIncomeRequest {
  amount: number;
  title?: string;
  description?: string;
  category: IncomeCategory;
  date: string;
}

export interface IncomeResponse {
  id: string;
  amount: number;
  title?: string;
  description?: string;
  category: IncomeCategory;
  date: string;
}

export interface UpdateIncomeRequest {
  amount?: number;
  title?: string;
  description?: string;
  category?: IncomeCategory;
  date?: string;
}

export interface IncomeStatisticsResponse {
  totalAmount: number;
}

export type PeriodType = 'all' | 'monthly' | 'daily';

export interface IncomeStatisticsParams {
  period: PeriodType;
  year?: number;
  month?: number;
  day?: number;
}

const buildQueryParams = (params: IncomeStatisticsParams): URLSearchParams => {
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

  return queryParams;
};

const getIncomeById = async (incomeId: string): Promise<IncomeResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/incomes/${encodeURIComponent(incomeId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get income failed' };
  }

  return response.json();
};

const updateIncome = async (
  incomeId: string,
  request: UpdateIncomeRequest
): Promise<IncomeResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/incomes/${encodeURIComponent(incomeId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Update income failed' };
  }

  return response.json();
};

const addIncome = async (request: AddIncomeRequest): Promise<IncomeResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/incomes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw { code: error.code, message: error.message };
  }

  return response.json();
};

const deleteIncome = async (incomeId: string): Promise<void> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/incomes/${encodeURIComponent(incomeId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Delete income failed' };
  }
};

const getIncomeStatistics = async (
  params: IncomeStatisticsParams
): Promise<IncomeStatisticsResponse> => {
  const token = await authService.getToken();
  const queryParams = buildQueryParams(params);

  const response = await fetch(`${API_URL}/api/incomes/statistics?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get income statistics failed' };
  }

  return response.json();
};

export const incomeService = {
  getIncomeById,
  updateIncome,
  addIncome,
  deleteIncome,
  getIncomeStatistics,
};
