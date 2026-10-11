import i18n from '@/i18n';

/**
 * API errors: the HTTP status says what kind of failure it is, the body is the message,
 * already translated via Accept-Language. Use case errors send a plain string; validation and
 * unhandled errors send ProblemDetails.
 */
type ProblemDetails = { title?: string; errors?: Record<string, string[]> };

export function getApiErrorStatus(error: unknown): number | null {
  return (error as { response?: { status?: number } })?.response?.status ?? null;
}

/** Localized message from the API, or the given fallback (defaults to the generic error). */
export function getApiErrorMessage(error: unknown, fallback?: string): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === 'string' && data) return data;
  if (data && typeof data === 'object') {
    const problem = data as ProblemDetails;
    const firstFieldError = problem.errors && Object.values(problem.errors)[0]?.[0];
    if (firstFieldError) return firstFieldError;
  }
  return fallback ?? i18n.t('common.errors.generic');
}

/** 402 Payment Required: the action needs Pro — open the ProGate instead of showing an error. */
export function isProRequired(error: unknown): boolean {
  return getApiErrorStatus(error) === 402;
}
