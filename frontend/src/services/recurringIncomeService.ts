import { authService, API_URL } from './authService';
import type { IncomeCategory } from '../constants/categories';

export type RecurrenceFrequency = 'WEEKLY' | 'MONTHLY';

export interface AddRecurringIncomeRequest {
  amount: number;
  title?: string;
  description?: string;
  category: IncomeCategory;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
}

export interface UpdateRecurringIncomeRequest {
  amount?: number;
  title?: string;
  description?: string;
  category?: IncomeCategory;
  frequency?: RecurrenceFrequency;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface RecurringIncomeResponse {
  id: string;
  amount: number;
  title?: string;
  description?: string;
  category: IncomeCategory;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  active: boolean;
}

const BASE_URL = `${API_URL}/api/incomes/recurring`;

const getRecurringIncomes = async (): Promise<RecurringIncomeResponse[]> => {
  const token = await authService.getToken();
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get recurring incomes failed' };
  }

  return response.json();
};

const getRecurringIncomeById = async (
  recurringIncomeId: string
): Promise<RecurringIncomeResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(recurringIncomeId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get recurring income failed' };
  }

  return response.json();
};

const addRecurringIncome = async (
  request: AddRecurringIncomeRequest
): Promise<RecurringIncomeResponse> => {
  const token = await authService.getToken();
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Add recurring income failed' };
  }

  return response.json();
};

const updateRecurringIncome = async (
  recurringIncomeId: string,
  request: UpdateRecurringIncomeRequest
): Promise<RecurringIncomeResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(recurringIncomeId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Update recurring income failed' };
  }

  return response.json();
};

const deleteRecurringIncome = async (recurringIncomeId: string): Promise<void> => {
  const token = await authService.getToken();
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(recurringIncomeId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Delete recurring income failed' };
  }
};

export const recurringIncomeService = {
  getRecurringIncomes,
  getRecurringIncomeById,
  addRecurringIncome,
  updateRecurringIncome,
  deleteRecurringIncome,
};
