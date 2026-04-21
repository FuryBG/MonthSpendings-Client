import { getCurrencies } from '@/app/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';

export const useCurrenciesQuery = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['currencies'],
    queryFn: getCurrencies,
    enabled: !!user,
  });
};
