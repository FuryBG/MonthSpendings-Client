import { AppUser, BankConsentDto, BankOption, BankTransaction, Budget, BudgetCategory, BudgetInvite, CategorizeBankTransactionDto, CategorizeTransactionDto, Currency, PeriodComparisonDto, Spending, UpdateUserActivityDto } from '@/types/Types';
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

const BASE_URL = "https://785a-88-203-208-219.ngrok-free.app";
console.log(`API ADDRESS: ${BASE_URL}`);


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let _memoryToken: string | null = null;

export const setMemoryToken = (token: string | null) => { _memoryToken = token; };

api.interceptors.request.use((config) => {
  console.log(`TOKEN: ${_memoryToken}`);
  console.log(`WHOLE REQUEST: ${JSON.stringify(config)}`);
  
  if (_memoryToken && config.headers) {
    config.headers.Authorization = `Bearer ${_memoryToken}`;
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
    const status = error?.response?.status;
    const url = error?.config?.url;
    const method = error?.config?.method?.toUpperCase();
    console.log(`API ERROR: ${method} ${url} → ${status}`);
    if (status === 401) {
      await SecureStore.deleteItemAsync('token');
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export const googleLogin = async (userDto: GoogleUserDto): Promise<string> => {
  console.log(`GG ${JSON.stringify(userDto)}`);
  
  const response = await api.post('/api/user', userDto);
  return response.data;
};

export const getUser = async (): Promise<AppUser> => {
  const response = await api.get('/api/user');
  return response.data;
};

export const updateUserActivity = async (dto: UpdateUserActivityDto): Promise<void> => {
  await api.put('/api/user/activity', dto);
};

export const getBanks = async (bankName: string): Promise<BankOption[]> => {
  const response = await api.get(`/api/bank?bankName=${bankName}`);
  return response.data;
};

export const startBankConnection = async (bankName: string, countryCode: string, bankImgUrl: string, maximumConsentValidity: number): Promise<string> => {
  const response = await api.get(`/api/Bank/connect?bankName=${bankName}&countryCode=${countryCode}&bankImageUrl=${bankImgUrl}&maximumConsentValidity=${maximumConsentValidity}`);
  return response.data;
};

export const getConnectedBanks = async (): Promise<BankConsentDto[]> => {
  const response = await api.get('/api/bank/connected');
  return response.data;
};

export const deleteBankConsent = async (sessionId: string): Promise<boolean> => {
  const response = await api.delete('/api/bank/delete', { params: { sessionId } });
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

export const categorizeBankTransaction = async (dto: CategorizeBankTransactionDto): Promise<Spending> => {
  const response = await api.post('/api/Transactions', dto);
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

export const finishBudget = async (budget: Budget): Promise<Budget> => {
  const response = await api.post("/api/budget/finish", { budget });
  return response.data;
};

// Statistics
export const getPeriodComparison = async (budgetId: number): Promise<PeriodComparisonDto> => {
  const response = await api.get(`/api/statistics/period-comparison?budgetId=${budgetId}`);
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
