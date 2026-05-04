import { authService, API_URL } from './authService';

export type MovementType = 'INCOME' | 'EXPENSE';

export interface MovementResponse {
  id: string;
  type: MovementType;
  amount: number;
  description?: string;
  category?: string;
  date: string;
}

const getMovements = async (): Promise<MovementResponse[]> => {
  const token = await authService.getToken();
  const response = await fetch(`${API_URL}/api/movements`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw { code: error.code, message: error.message };
  }

  return response.json();
};

export const movementService = { getMovements };
