import {
  createBudget,
  createBudgetCategory,
  createSpending,
  deleteBudget,
  deleteBudgetCategory,
  deleteSpending,
  finishBudget,
  getBudgets,
} from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { Budget, BudgetCategory, Spending } from '@/types/Types';
import { MutationMeta, useMutation, useQuery } from '@tanstack/react-query';

export const useBudgetsQuery = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgets,
    enabled: !!user,
  });
};

export const useAddSpendingMutation = () =>
  useMutation({
    mutationFn: (spending: Spending) => createSpending(spending),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

export const useDeleteSpendingMutation = () =>
  useMutation({
    mutationFn: (spendingId: number) => deleteSpending(spendingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

export const useCreateBudgetMutation = () =>
  useMutation({
    mutationFn: (budget: Budget) => createBudget(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

export const useDeleteBudgetMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: (budgetId: number) => deleteBudget(budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    meta,
  });

export const useAddBudgetCategoryMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: (category: BudgetCategory) => createBudgetCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    meta,
  });

export const useDeleteBudgetCategoryMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: (categoryId: number) => deleteBudgetCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    meta,
  });

export const useFinishBudgetMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: (budget: Budget) => finishBudget(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    meta,
  });
