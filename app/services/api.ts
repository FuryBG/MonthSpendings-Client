import { AppUser, BankOption, BankTransaction, Budget, BudgetCategory, BudgetInvite, CategorizeTransactionDto, Currency, PeriodComparisonDto, SavingsContribution, SavingsHistoryDto, SavingsPot, SavingsPotInvite, Spending } from '@/types/Types';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface GoogleAuthResponse {
  jwt: string;
  user: string;
}

export interface GoogleUserDto {
  id: string,
  email: string | null,
  givenName: string | null,
  familyName: string | null,
  photo: string | null,
  notificationToken: string
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://355d-88-203-208-219.ngrok-free.app';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export const googleLogin = async (userDto: GoogleUserDto): Promise<string> => {
  const response = await api.post('/api/user', userDto);
  return response.data;
};

export const getUser = async (): Promise<AppUser> => {
  const response = await api.get('/api/user');
  return response.data;
};

export const getBanks = async (bankName: string): Promise<BankOption[]> => {
  const response = await api.get(`/api/bank?bankName=${bankName}`);
  return response.data;
};

export const startBankConnection = async (bankName: string, countryCode: string, bankImgUrl: string, maximumConsentValidity: number): Promise<string> => {
  const response = await api.get(`/api/Bank/connect?bankName=${bankName}&countryCode=${countryCode}&bankImageUrl=${bankImgUrl}&maximumConsentValidity=${maximumConsentValidity}`);
  return response.data;
};

export const getNotCategorizedTransactions = async (): Promise<BankTransaction[]> => {
  const response = await api.get('/api/Transactions');
  return response.data;
};

export const categorizeTransaction = async (transaction: CategorizeTransactionDto): Promise<Spending> => {
  const response = await api.post('/api/Transactions', transaction);
  return response.data;
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
  const response = await api.delete("/api/spending", {
    params: { spendingId }
  });
  return response.data;
};

export const deleteBudgetCategory = async (budgetCategoryId: number): Promise<number> => {
  const response = await api.delete("/api/budgetcategory", {
    params: { budgetCategoryId }
  });
  return response.data;
};

export const deleteBudget = async (budgetId: number): Promise<number> => {
  const response = await api.delete("/api/budget", {
    params: { budgetId }
  });
  return response.data;
};

export const finishBudget = async (budget: Budget, savingsPotId?: number): Promise<Budget> => {
  const response = await api.post("/api/budget/finish", { budget, savingsPotId: savingsPotId ?? null });
  return response.data;
};

// Statistics
export const getPeriodComparison = async (budgetId: number): Promise<PeriodComparisonDto> => {
  const response = await api.get(`/api/statistics/period-comparison?budgetId=${budgetId}`);
  return response.data;
};

// Savings
export const getSavingsPots = async (): Promise<SavingsPot[]> => {
  const response = await api.get('/api/savings');
  return response.data;
};

export const createSavingsPot = async (pot: Pick<SavingsPot, 'name' | 'currency'>): Promise<SavingsPot> => {
  const response = await api.post('/api/savings', pot);
  return response.data;
};

export const deleteSavingsPot = async (potId: number): Promise<number> => {
  const response = await api.delete('/api/savings', { params: { potId } });
  return response.data;
};

export const addSavingsContribution = async (potId: number, dto: Pick<SavingsContribution, 'amount' | 'note'>): Promise<SavingsContribution> => {
  const response = await api.post(`/api/savings/${potId}/contribution`, dto);
  return response.data;
};

export const removeSavingsContribution = async (potId: number, contributionId: number): Promise<number> => {
  const response = await api.delete(`/api/savings/${potId}/contribution`, { params: { contributionId } });
  return response.data;
};

export const getSavingsHistory = async (potId: number): Promise<SavingsHistoryDto> => {
  const response = await api.get(`/api/savings/${potId}/history`);
  return response.data;
};

export const sendSavingsPotInvite = async (invite: Pick<SavingsPotInvite, 'savingsPotId' | 'receiverEmail'>): Promise<SavingsPotInvite> => {
  const response = await api.post('/api/savingspotinvite', invite);
  return response.data;
};

export const respondToSavingsPotInvite = async (inviteId: number, accepted: boolean): Promise<boolean> => {
  const response = await api.patch(`/api/savingspotinvite/${inviteId}`, accepted);
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

export default api;
