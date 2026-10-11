import i18n from '@/i18n';

// Spendings created by the app carry these fixed descriptions (stored as-is in the DB);
// show them translated instead of the raw marker.
const SYSTEM_DESCRIPTIONS = {
  'ADD MONEY': 'spending.system.addMoney',
  'MOVED TO NEXT PERIOD': 'spending.system.movedToNextPeriod',
} as const;

export function displaySpendingDescription(description: string): string {
  const key = SYSTEM_DESCRIPTIONS[description as keyof typeof SYSTEM_DESCRIPTIONS];
  return key ? i18n.t(key) : description;
}
