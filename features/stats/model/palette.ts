import { Tavira } from '@/constants/theme';

// Category hues tuned to sit next to Tavira navy/teal/purple in both themes.
const CATEGORY_PALETTE = [
  Tavira.teal,
  Tavira.purple,
  '#F2B544', // amber
  '#FF7A8A', // coral
  '#4FD1A5', // mint
  '#A98BFF', // violet
  '#64B5F6', // sky
  '#E58BD6', // orchid
] as const;

const DELETED_COLOR = '#8A94A6';

/** Stable per category id, so a category keeps its colour on every chart and screen. */
export function categoryColor(categoryId: number, isDeleted = false): string {
  if (isDeleted) return DELETED_COLOR;
  return CATEGORY_PALETTE[Math.abs(categoryId) % CATEGORY_PALETTE.length];
}

export const COMPARE_A_COLOR = Tavira.teal;
export const COMPARE_B_COLOR = Tavira.purple;
