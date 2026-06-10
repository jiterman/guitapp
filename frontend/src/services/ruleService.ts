import { authService, API_URL } from './authService';
import type { ExpenseCategory, ExpenseType } from '../constants/categories';

export interface CategoryRuleRequest {
  category: ExpenseCategory;
  type: ExpenseType;
}

export interface UpdateCategoryRuleRequest {
  type: ExpenseType;
}

export interface CategoryRuleResponse {
  id: number;
  category: ExpenseCategory;
  type: ExpenseType;
}

const getCategoryRules = async (): Promise<CategoryRuleResponse[]> => {
  const token = await authService.getToken();

  try {
    const response = await fetch(`${API_URL}/api/rules/categories`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || 'Error al obtener las reglas de categoría');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(handleServiceError(error));
  }
};

const createCategoryRule = async (request: CategoryRuleRequest): Promise<CategoryRuleResponse> => {
  const token = await authService.getToken();

  try {
    const response = await fetch(`${API_URL}/api/rules/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const exactErrorMessage = data?.message || 'Error al crear la regla de categoría';
      throw new Error(exactErrorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(handleServiceError(error));
  }
};

const updateCategoryRule = async (
  id: number,
  request: UpdateCategoryRuleRequest
): Promise<{ message: string }> => {
  const token = await authService.getToken();

  try {
    const response = await fetch(`${API_URL}/api/rules/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const exactErrorMessage = data?.message || 'Error al actualizar la regla de categoría';
      throw new Error(exactErrorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(handleServiceError(error));
  }
};

const deleteCategoryRule = async (id: number): Promise<{ message: string }> => {
  const token = await authService.getToken();

  try {
    const response = await fetch(`${API_URL}/api/rules/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const exactErrorMessage = data?.message || 'Error al eliminar la regla de categoría';
      throw new Error(exactErrorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(handleServiceError(error));
  }
};

const handleServiceError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message === 'Network request failed') {
      return 'No se pudo conectar al servidor. Intentá nuevamente';
    }
    return error.message;
  }
  return 'Error de conexión. Intentá nuevamente';
};

export const ruleService = {
  getCategoryRules,
  createCategoryRule,
  updateCategoryRule,
  deleteCategoryRule,
};
