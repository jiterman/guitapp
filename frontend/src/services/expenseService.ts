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

export interface AddExpenseRequest {
  amount: number;
  description?: string;
  category: ExpenseCategory;
}

export interface ExpenseResponse {
  id: string;
  amount: number;
  description?: string;
  category: ExpenseCategory;
  date: string;
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

export const expenseService = { addExpense };
