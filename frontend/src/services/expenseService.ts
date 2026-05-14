import { authService, API_URL } from './authService';

export type ExpenseCategory =
  | 'SUPERMARKET'
  | 'RESTAURANT'
  | 'CAFE'
  | 'DELIVERY'
  | 'PUBLIC_TRANSPORT'
  | 'FUEL'
  | 'TAXI'
  | 'UTILITIES'
  | 'RENT'
  | 'HOME'
  | 'DOCTOR'
  | 'PHARMACY'
  | 'SUBSCRIPTIONS'
  | 'OUTINGS'
  | 'BAR'
  | 'GYM'
  | 'TRAVEL'
  | 'CLOTHING'
  | 'EDUCATION'
  | 'TECHNOLOGY'
  | 'BEAUTY'
  | 'HOA_FEES'
  | 'VEHICLE'
  | 'PETS'
  | 'OTHER';

export type ExpenseType = 'FIXED' | 'VARIABLE';

export interface AddExpenseRequest {
  amount: number;
  description?: string;
  category: ExpenseCategory;
  type: ExpenseType;
}

export interface ExpenseResponse {
  id: string;
  amount: number;
  description?: string;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  description?: string;
  category?: ExpenseCategory;
  type?: ExpenseType;
}

const addExpense = async (request: AddExpenseRequest): Promise<ExpenseResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/expenses`, {
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

const updateExpense = async (
  expenseId: string,
  request: UpdateExpenseRequest
): Promise<ExpenseResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/expenses/${encodeURIComponent(expenseId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Update expense failed' };
  }

  return response.json();
};

const getExpenseById = async (expenseId: string): Promise<ExpenseResponse> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/expenses/${encodeURIComponent(expenseId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get expense failed' };
  }

  return response.json();
};

const deleteExpense = async (expenseId: string): Promise<void> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/expenses/${encodeURIComponent(expenseId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Delete expense failed' };
  }
};

export const expenseService = {
  getExpenseById,
  updateExpense,
  deleteExpense,
  addExpense,
};
