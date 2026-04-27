import {
  createBudget,
  createBudgetCategory,
  createSpending,
  deleteBudget,
  deleteBudgetCategory,
  deleteSpending,
  finishBudget,
  getBudgets,
  updateBudgetCategoryName,
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
    mutationFn: ({ budget, savingsPotId }: { budget: Budget; savingsPotId?: number }) =>
      finishBudget(budget, savingsPotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
    meta,
  });

export const useUpdateBudgetCategoryNameMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: ({ id, newName }: { id: number; newName: string }) => updateBudgetCategoryName(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    meta,
  });
