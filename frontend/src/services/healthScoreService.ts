import { authService, API_URL } from './authService';

export interface HealthScoreFactor {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface HealthScoreResponse {
  score: number;
  title: string;
  message: string;
  level: 'excellent' | 'great' | 'good' | 'fair' | 'poor';
  factors: HealthScoreFactor[];
}

const getHealthScore = async (year: number, month: number): Promise<HealthScoreResponse> => {
  const token = await authService.getToken();
  const params = new URLSearchParams({ year: year.toString(), month: month.toString() });

  const response = await fetch(`${API_URL}/api/summary/monthly/health-score?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { code: error.code, message: error.message ?? 'Get health score failed' };
  }

  return response.json();
};

export const healthScoreService = {
  getHealthScore,
};
