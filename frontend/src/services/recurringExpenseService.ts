import { authService, API_URL } from './authService';
import type { ExpenseCategory, ExpenseType } from '../constants/categories';
import type { RecurrenceFrequency } from './recurringIncomeService';

export interface AddRecurringExpenseRequest {
  amount: number;
  title?: string;
  description?: string;
  category: ExpenseCategory;
  type: ExpenseType;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
}

export interface UpdateRecurringExpenseRequest {
  amount?: number;
  title?: string;
  description?: string;
  category?: ExpenseCategory;
  type?: ExpenseType;
  frequency?: RecurrenceFrequency;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface RecurringExpenseResponse {
  id: string;
  amount: number;
  title?: string;
  description?: string;
  category: ExpenseCategory;
  type: ExpenseType;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  active: boolean;
}

const BASE_URL = `${API_URL}/api/expenses/recurring`;

const getRecurringExpenses = async (): Promise<RecurringExpenseResponse[]> => {
  const token = await authService.getToken();
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get recurring expenses failed' };
  }

  return response.json();
};

const addRecurringExpense = async (
  request: AddRecurringExpenseRequest
): Promise<RecurringExpenseResponse> => {
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
    throw { code: error.code, message: error.message ?? 'Add recurring expense failed' };
  }

  return response.json();
};

const updateRecurringExpense = async (
  recurringExpenseId: string,
  request: UpdateRecurringExpenseRequest
): Promise<RecurringExpenseResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(recurringExpenseId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Update recurring expense failed' };
  }

  return response.json();
};

const deleteRecurringExpense = async (recurringExpenseId: string): Promise<void> => {
  const token = await authService.getToken();
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(recurringExpenseId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Delete recurring expense failed' };
  }
};

export const recurringExpenseService = {
  getRecurringExpenses,
  addRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
};
