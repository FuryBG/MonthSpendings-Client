import { useSnackbarStore } from '@/stores/snackbarStore';
import { MutationCache, QueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/utils/apiError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.meta?.skipGlobalError) return;
      // The API returns a message already localized via Accept-Language.
      useSnackbarStore.getState().showError(getApiErrorMessage(error));
    },
  }),
});
