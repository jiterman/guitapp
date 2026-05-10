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

const fetchMovements = async (url: string): Promise<MovementResponse[]> => {
  const token = await authService.getToken();
  const response = await fetch(url, {
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

const getMovements = async (): Promise<MovementResponse[]> =>
  fetchMovements(`${API_URL}/api/movements`);

const getMovementsByDay = async (date: string): Promise<MovementResponse[]> =>
  fetchMovements(`${API_URL}/api/movements/day?date=${encodeURIComponent(date)}`);

const getMovementsByMonth = async (year: number, month: number): Promise<MovementResponse[]> =>
  fetchMovements(`${API_URL}/api/movements/month?year=${year}&month=${month}`);

const getMovementsByYear = async (year: number): Promise<MovementResponse[]> =>
  fetchMovements(`${API_URL}/api/movements/year?year=${year}`);

export const movementService = {
  getMovements,
  getMovementsByDay,
  getMovementsByMonth,
  getMovementsByYear,
};
