import { authService, API_URL } from './authService';
import { eventEmitter } from '../utils/eventEmitter';
import type { ExpenseCategory, ExpenseType } from '../constants/categories';

export interface AddExpenseRequest {
  amount: number;
  title?: string;
  description?: string;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
}

export interface ExpenseResponse {
  id: string;
  amount: number;
  title?: string;
  description?: string;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
}

export interface UpdateExpenseRequest {
  amount?: number;
  title?: string;
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

  const expense = await response.json();
  eventEmitter.emit('notificationsUpdated');
  return expense;
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

export interface ReceiptAnalysisResponse {
  amount?: number;
  title?: string;
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

const analyzeVoice = async (audioUri: string): Promise<ReceiptAnalysisResponse> => {
  const token = await authService.getToken();

  const filename = audioUri.split('/').pop() || 'audio.wav';
  const fileExtension = filename.split('.').pop() || 'wav';
  let mimeType = 'audio/wav';
  if (fileExtension === 'amr') {
    mimeType = 'audio/amr';
  } else if (fileExtension === 'm4a') {
    mimeType = 'audio/m4a';
  }

  const formData = new FormData();
  // @ts-expect-error - FormData append for files is not fully typed in React Native
  formData.append('file', {
    uri: audioUri,
    name: filename,
    type: mimeType,
  });

  const response = await fetch(`${API_URL}/api/expenses/analyze-voice`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Voice analysis failed' };
  }

  return response.json();
};

export const expenseService = {
  getExpenseById,
  updateExpense,
  deleteExpense,
  addExpense,
  analyzeReceipt,
  analyzeVoice,
};
