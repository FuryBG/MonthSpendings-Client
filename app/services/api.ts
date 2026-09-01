import { AppUser, AuthResponse, Budget, BudgetCategory, BudgetInvite, CategorizeNotificationTransactionDto, CreateNotificationTransactionDto, Currency, NotificationTransaction, PeriodComparisonDto, PeriodHistoryItemDto, Spending, UpdateUserActivityDto } from '@/types/Types';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { NativeModules } from 'react-native';

export interface GoogleUserDto {
  id: string,
  email: string | null,
  givenName: string | null,
  familyName: string | null,
  photo: string | null,
  notificationToken: string
}

export const BASE_URL = process.env["EXPO_PUBLIC_API_URL"] ?? "https://f693-88-203-208-219.ngrok-free.app";
console.log(`API ADDRESS: ${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let _memoryToken: string | null = null;

export const setMemoryToken = (token: string | null) => { _memoryToken = token; };

api.interceptors.request.use((config) => {
  if (_memoryToken && config.headers) {
    config.headers.Authorization = `Bearer ${_memoryToken}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

// Refresh token queue — prevents concurrent 401s from triggering multiple refreshes
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

const AUTH_URLS = ['/api/auth/refresh', '/api/auth/login', '/api/auth/register', '/api/user'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status = error?.response?.status;
    const url: string = originalRequest?.url ?? '';

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !AUTH_URLS.some((u) => url.includes(u))
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token stored');

        const { data } = await api.post<AuthResponse>('/api/auth/refresh', { refreshToken });

        setMemoryToken(data.accessToken);
        NativeModules.WalletSync?.setToken(data.accessToken).catch?.(() => {});
        await SecureStore.setItemAsync('token', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setMemoryToken(null);
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        onUnauthorized?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const googleLogin = async (userDto: GoogleUserDto): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/user', userDto);
  return response.data;
};

export const registerWithEmail = async (dto: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', dto);
  return response.data;
};

export const loginWithEmail = async (dto: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', dto);
  return response.data;
};

export const revokeToken = async (refreshToken: string): Promise<void> => {
  await api.post('/api/auth/revoke', { refreshToken });
};

export const getUser = async (): Promise<AppUser> => {
  const response = await api.get('/api/user');
  return response.data;
};

export const updateUserActivity = async (dto: UpdateUserActivityDto): Promise<void> => {
  await api.put('/api/user/activity', dto);
};

export const updateNotificationToken = async (token: string): Promise<void> => {
  await api.put('/api/user/notification-token', { notificationToken: token });
};

export const updateSyncWalletTransactions = async (sync: boolean): Promise<void> => {
  await api.put('/api/user/sync-wallet-transactions', { syncWalletTransactions: sync });
};

export const createNotificationTransaction = async (dto: CreateNotificationTransactionDto): Promise<NotificationTransaction> => {
  const response = await api.post('/api/notification-transactions', dto);
  return response.data;
};

export const getUncategorizedNotificationTransactions = async (): Promise<NotificationTransaction[]> => {
  const response = await api.get('/api/notification-transactions');
  return response.data;
};

export const categorizeNotificationTransaction = async (dto: CategorizeNotificationTransactionDto): Promise<Spending> => {
  const response = await api.post('/api/notification-transactions/categorize', dto);
  return response.data;
};

export const deleteNotificationTransaction = async (id: number): Promise<void> => {
  await api.delete(`/api/notification-transactions/${id}`);
};

export const createBudget = async (budget: Budget): Promise<Budget> => {
  const response = await api.post('/api/budget', budget);
  return response.data;
};

export const getBudgets = async (): Promise<Budget[]> => {
  const response = await api.get('/api/budget');
  return response.data;
};

export const getCurrencies = async (): Promise<Currency[]> => {
  const response = await api.get('/api/currency');
  return response.data;
};

export const createSpending = async (spending: Spending): Promise<Spending> => {
  const response = await api.post('/api/spending', spending);
  return response.data;
};

export const createBudgetCategory = async (budgetCategory: BudgetCategory): Promise<BudgetCategory> => {
  const response = await api.post('/api/budgetcategory', budgetCategory);
  return response.data;
};

export const deleteSpending = async (spendingId: number): Promise<number> => {
  const response = await api.delete("/api/spending", { params: { spendingId } });
  return response.data;
};

export const deleteBudgetCategory = async (budgetCategoryId: number): Promise<number> => {
  const response = await api.delete("/api/budgetcategory", { params: { budgetCategoryId } });
  return response.data;
};

export const deleteBudget = async (budgetId: number): Promise<number> => {
  const response = await api.delete("/api/budget", { params: { budgetId } });
  return response.data;
};

export const finishBudget = async (budget: Budget): Promise<Budget> => {
  const response = await api.post("/api/budget/finish", { budget });
  return response.data;
};

export const getSpendingsByCategoryAndPeriod = async (budgetCategoryId: number, budgetPeriodId: number): Promise<Spending[]> => {
  const response = await api.get('/api/spending/by-period', { params: { budgetCategoryId, budgetPeriodId } });
  return response.data;
};

export const getPeriodComparison = async (budgetId: number): Promise<PeriodComparisonDto> => {
  const response = await api.get(`/api/statistics/period-comparison?budgetId=${budgetId}`);
  return response.data;
};

export const getPeriodsHistory = async (budgetId: number): Promise<PeriodHistoryItemDto[]> => {
  const response = await api.get(`/api/statistics/periods-history?budgetId=${budgetId}`);
  return response.data;
};

export const createInvite = async (budgetInvite: BudgetInvite): Promise<number> => {
  const response = await api.post("/api/budgetinvite", budgetInvite);
  return response.data;
};

export const respondToInvite = async (inviteId: number, accepted: boolean): Promise<number> => {
  const response = await api.patch(`/api/budgetinvite/${inviteId}`, accepted);
  return response.data;
};

export const updateBudgetCategoryName = async (id: number, newName: string): Promise<BudgetCategory> => {
  const response = await api.patch(`/api/budgetcategory/${id}/name`, newName);
  return response.data;
};

export const requestAccountDeletion = async (): Promise<void> => {
  await api.post('/api/user/delete-request');
};

export default api;
