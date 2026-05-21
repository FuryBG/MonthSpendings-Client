import { getNotCategorizedTransactions, categorizeBankTransaction } from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { CategorizeBankTransactionDto } from '@/types/Types';
import { useMutation, useQuery } from '@tanstack/react-query';

export const usePendingTransactionsQuery = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['pendingTransactions'],
    queryFn: getNotCategorizedTransactions,
    enabled: !!user,
  });
};

export const useCategorizeTransactionMutation = () =>
  useMutation({
    mutationFn: (dto: CategorizeBankTransactionDto) => categorizeBankTransaction(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['period-comparison'] });
    },
  });
