import { AppUser, Budget, BudgetCategory, BudgetInvite, Spending } from '@/types/Types';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
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

const BASE_URL = ' https://ventless-scribal-loan.ngrok-free.dev';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every request automatically
api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const googleLogin = async (userDto: GoogleUserDto): Promise<string> => {
  const response = await api.post<GoogleAuthResponse>('/api/user', userDto);
  const jwt = response.data;
  return jwt;

};

export const getUser = async (): Promise<AppUser> => {
  const response = await api.get<GoogleAuthResponse>('/api/user');
  const userData = response.data;
  return userData;

};

export const createBudget = async (budget: Budget): Promise<Budget> => {
  const response = await api.post<string>('/api/budget', budget);
  const b = response.data;
  return b;
};

export const getBudgets = async (): Promise<Budget[]> => {
  const response = await api.get<boolean>('/api/budget');
  console.log(response.data);

  const b = response.data;
  return b;
};

export const createSpending = async (spending: Spending): Promise<Spending> => {
  const response = await api.post<boolean>('/api/spending', spending);
  console.log(response.data);

  const b = response.data;
  return b;
};

export const createBudgetCategory = async (budgetCategory: BudgetCategory): Promise<BudgetCategory> => {
  const response = await api.post<boolean>('/api/budgetcategory', budgetCategory);
  console.log(response.data);

  const b = response.data;
  return b;
};

export const deleteSpending = async (spendingId: number): Promise<number> => {
  const response = await api.delete<number>("/api/spending", {
    params: { spendingId: spendingId }
  });

  console.log(response.data);

  const b = response.data;
  return b;
};

export const deleteBudgetCategory = async (budgetCategoryId: number): Promise<number> => {
  const response = await api.delete<number>("/api/budgetcategory", {
    params: { budgetCategoryId: budgetCategoryId }
  });

  console.log(response.data);

  const b = response.data;
  return b;
};

export const deleteBudget = async (budgetId: number): Promise<number> => {
  const response = await api.delete<number>("/api/budget", {
    params: { budgetId: budgetId }
  });

  console.log(response.data);

  const b = response.data;
  return b;
};

export const finishBudget = async (budget: Budget): Promise<number> => {
  const response = await api.post<Budget>("/api/budget/finish", budget);

  console.log(response.data);

  const b = response.data;
  return b;
};

export const createInvite = async (budgetInvite: BudgetInvite): Promise<number> => {
  const response = await api.post<Budget>("/api/budgetinvite", budgetInvite);

  console.log(response.data);

  const b = response.data;
  return b;
};

export const respondToInvite = async (inviteId: number, accepted: boolean): Promise<number> => {
  const response = await api.patch<Budget>(`/api/budgetinvite/${inviteId}`, accepted);

  console.log(response.data);

  const b = response.data;
  return b;
};


export default api;