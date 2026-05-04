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

export const incomeService = { addIncome };
