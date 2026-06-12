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

const handleServiceError = (error: unknown, fallbackMessage: string): Error => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (
      msg.includes('network request failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('aborted')
    ) {
      return new Error('No se pudo conectar al servidor. Intentá nuevamente.');
    }
    return error;
  }
  return new Error(fallbackMessage);
};

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
      if (response.status === 401)
        throw new Error('Sesión expirada. Por favor, volvé a iniciar sesión.');
      throw new Error(data?.message || 'Error al obtener las reglas de categoría');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Error al obtener las reglas de categoría');
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
      if (response.status === 401)
        throw new Error('Sesión expirada. Por favor, volvé a iniciar sesión.');
      throw new Error(data?.message || 'Error al crear la regla de categoría');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Error al crear la regla de categoría');
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
      if (response.status === 401)
        throw new Error('Sesión expirada. Por favor, volvé a iniciar sesión.');
      throw new Error(data?.message || 'Error al actualizar la regla de categoría');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Error al actualizar la regla de categoría');
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
      if (response.status === 401)
        throw new Error('Sesión expirada. Por favor, volvé a iniciar sesión.');
      throw new Error(data?.message || 'Error al eliminar la regla de categoría');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Error al eliminar la regla de categoría');
  }
};

export const ruleService = {
  getCategoryRules,
  createCategoryRule,
  updateCategoryRule,
  deleteCategoryRule,
};
