import { httpGet, httpPatch, httpDelete } from '../lib/http';

const BASE_URL = '/notifications';

const getCurrentUserId = (): number | null => {
  try {
    const userStorage = localStorage.getItem('user-storage');
    return userStorage ? JSON.parse(userStorage)?.state?.user?.userId : null;
  } catch (error) {
    return null;
  }
};

export type NotificationType = 'CONSULTATION' | 'TRANSACTION' | 'SYSTEM' | 'SCHEDULE' | 'OTHER';

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
}

export const fetchNotifications = async (page: number = 0, size: number = 20): Promise<{ content: Notification[]; totalElements: number; totalPages: number }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = { page, size };
    if (userId) params.userId = userId;

    return await httpGet<{ content: Notification[]; totalElements: number; totalPages: number }>(BASE_URL, params);
  } catch (error) {
    throw error;
  }
};

export const fetchUnreadNotifications = async (page: number = 0, size: number = 20, userId?: number): Promise<{ content: Notification[]; totalElements: number; totalPages: number }> => {
  try {
    const params: any = { page, size };
    if (userId) params.userId = userId;

    return await httpGet<{ content: Notification[]; totalElements: number; totalPages: number }>(`${BASE_URL}/unread`, params);
  } catch (error) {
    throw error;
  }
};

export const fetchNotificationSummary = async (userId?: number): Promise<NotificationSummary> => {
  try {
    return await httpGet<NotificationSummary>(`${BASE_URL}/summary`, userId ? { userId } : {});
  } catch (error) {
    throw error;
  }
};

export const fetchNotificationsByType = async (type: NotificationType, page: number = 0, size: number = 20): Promise<{ content: Notification[]; totalElements: number; totalPages: number }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = { page, size };
    if (userId) params.userId = userId;

    return await httpGet<{ content: Notification[]; totalElements: number; totalPages: number }>(`${BASE_URL}/type/${type}`, params);
  } catch (error) {
    throw error;
  }
};

export const fetchNotificationsByPeriod = async (
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 20
): Promise<{ content: Notification[]; totalElements: number; totalPages: number }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = { startDate, endDate, page, size };
    if (userId) params.userId = userId;

    return await httpGet<{ content: Notification[]; totalElements: number; totalPages: number }>(`${BASE_URL}/period`, params);
  } catch (error) {
    throw error;
  }
};

export const fetchNotification = async (notificationId: number): Promise<Notification> => {
  try {
    const userId = getCurrentUserId();

    const params: any = {};
    if (userId) params.userId = userId;

    return await httpGet<Notification>(`${BASE_URL}/${notificationId}`, params);
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  try {
    const userId = getCurrentUserId();

    const params: any = {};
    if (userId) params.userId = userId;

    return await httpPatch<Notification>(`${BASE_URL}/${notificationId}/read`, null, { params });
  } catch (error) {
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = {};
    if (userId) params.userId = userId;

    return await httpPatch<{ success: boolean; message: string }>(`${BASE_URL}/read-all`, null, { params });
  } catch (error) {
    throw error;
  }
};

export const markAllNotificationsAsReadByType = async (type: NotificationType): Promise<{ success: boolean; message: string }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = {};
    if (userId) params.userId = userId;

    return await httpPatch<{ success: boolean; message: string }>(`${BASE_URL}/type/${type}/read-all`, null, { params });
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (notificationId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = {};
    if (userId) params.userId = userId;

    return await httpDelete<{ success: boolean; message: string }>(`${BASE_URL}/${notificationId}`, params);
  } catch (error) {
    throw error;
  }
};

export const deleteNotifications = async (notificationIds: number[]): Promise<{ success: boolean; message: string }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = { ids: notificationIds };
    if (userId) params.userId = userId;

    return await httpDelete<{ success: boolean; message: string }>(`${BASE_URL}/batch`, params);
  } catch (error) {
    throw error;
  }
};

export const cleanupOldNotifications = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const userId = getCurrentUserId();

    const params: any = {};
    if (userId) params.userId = userId;

    return await httpDelete<{ success: boolean; message: string }>(`${BASE_URL}/cleanup`, params);
  } catch (error) {
    throw error;
  }
};