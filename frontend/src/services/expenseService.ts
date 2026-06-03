import { authService, API_URL } from './authService';
import type { ExpenseCategory, ExpenseType } from '../constants/categories';
import { scheduleNotificationBadgeRefresh } from '../utils/notificationBadge';

export interface AddExpenseRequest {
  amount: number;
  description?: string;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
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
  date?: string;
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

  const created = await response.json();
  scheduleNotificationBadgeRefresh();
  return created;
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

  const updated = await response.json();
  scheduleNotificationBadgeRefresh();
  return updated;
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

export interface ReceiptAnalysisResponse {
  amount?: number;
  description?: string;
  category?: ExpenseCategory;
  date?: string;
}

const analyzeReceipt = async (imageUri: string): Promise<ReceiptAnalysisResponse> => {
  const token = await authService.getToken();

  const formData = new FormData();
  // @ts-expect-error - FormData append for files is not fully typed in React Native
  formData.append('file', {
    uri: imageUri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  });

  const response = await fetch(`${API_URL}/api/expenses/analyze-receipt`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Receipt analysis failed' };
  }

  return response.json();
};

export const expenseService = {
  getExpenseById,
  updateExpense,
  deleteExpense,
  addExpense,
  analyzeReceipt,
};
