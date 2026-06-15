import { deleteBankConsent, getConnectedBanks } from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useConnectedBanksQuery = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['connectedBanks'],
    queryFn: getConnectedBanks,
    enabled: !!user,
  });
};

export const useDeleteBankConsentMutation = () =>
  useMutation({
    mutationFn: (sessionId: string) => deleteBankConsent(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectedBanks'] });
    },
  });
