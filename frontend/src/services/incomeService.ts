import { authService, API_URL } from './authService';

export type IncomeCategory = 'SALARY' | 'FREELANCE' | 'GIFT' | 'INVESTMENT' | 'OTHER';

export interface AddIncomeRequest {
  amount: number;
  description?: string;
  category: IncomeCategory;
}

export interface IncomeResponse {
  id: string;
  amount: number;
  description?: string;
  category: IncomeCategory;
  date: string;
}

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

export const incomeService = { getIncomeById, addIncome, deleteIncome };
