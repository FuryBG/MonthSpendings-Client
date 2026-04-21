import { useSnackbarStore } from '@/stores/snackbarStore';
import { MutationCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
  mutationCache: new MutationCache({
    onError: (_error, _variables, _context, mutation) => {
      if (mutation.options.meta?.skipGlobalError) return;
      useSnackbarStore.getState().showError('Something went wrong. Please try again later.');
    },
  }),
});
