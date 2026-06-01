import { authService, API_URL } from './authService';

export type AlertType =
  | 'FIXED_EXPENSE_THRESHOLD_EXCEEDED'
  | 'VARIABLE_EXPENSE_THRESHOLD_EXCEEDED'
  | 'SAVINGS_GOAL_AT_RISK'
  | 'NEGATIVE_BALANCE_RISK'
  | 'CATEGORY_OVERSPENDING';

export interface Notification {
  id: number;
  type: AlertType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const token = await authService.getToken();
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  },

  getUnreadCount: async (): Promise<number> => {
    const token = await authService.getToken();
    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    return response.json();
  },

  markAsRead: async (id: number): Promise<void> => {
    const token = await authService.getToken();
    const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const token = await authService.getToken();
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },
};
