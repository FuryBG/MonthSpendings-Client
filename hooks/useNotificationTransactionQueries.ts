import { categorizeNotificationTransaction, createNotificationTransaction, deleteNotificationTransaction, getUncategorizedNotificationTransactions } from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { CategorizeNotificationTransactionDto, CreateNotificationTransactionDto } from '@/types/Types';
import { useMutation, useQuery } from '@tanstack/react-query';

export const PENDING_NOTIFICATION_TRANSACTIONS_KEY = ['pendingNotificationTransactions'] as const;

export const usePendingNotificationTransactionsQuery = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: PENDING_NOTIFICATION_TRANSACTIONS_KEY,
    queryFn: getUncategorizedNotificationTransactions,
    enabled: !!user,
  });
};

export const useCategorizeNotificationTransactionMutation = () =>
  useMutation({
    mutationFn: (dto: CategorizeNotificationTransactionDto) => categorizeNotificationTransaction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_NOTIFICATION_TRANSACTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['period-comparison'] });
    },
  });

export const useCreateNotificationTransactionMutation = () =>
  useMutation({
    mutationFn: (dto: CreateNotificationTransactionDto) => createNotificationTransaction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_NOTIFICATION_TRANSACTIONS_KEY });
    },
  });

export const useDeleteNotificationTransactionMutation = () =>
  useMutation({
    mutationFn: (id: number) => deleteNotificationTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_NOTIFICATION_TRANSACTIONS_KEY });
    },
  });
