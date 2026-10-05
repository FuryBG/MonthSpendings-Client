import { Tavira } from '@/constants/theme';
import type { AppUser, Spending } from '@/types/Types';

export type ParticipantShare = {
  userId: number;
  name: string;
  photoUrl: string | null;
  isYou: boolean;
  spent: number;   // positive total of outgoing spendings
  share: number;   // % of everyone's spending
  count: number;   // number of outgoing spendings
  color: string;
};

const PARTICIPANT_COLORS = [Tavira.teal, Tavira.purple, '#F2B544', '#FF7A8A', '#4FD1A5', '#A98BFF', '#64B5F6', '#E58BD6'];

function fullName(user: Pick<AppUser, 'firstName' | 'lastName' | 'email'>): string {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email;
}

/**
 * Splits a category's outgoing spendings by who added them.
 * Every budget member is listed (even with nothing spent); people who left the budget
 * but still have spendings are included from the spending's creator info.
 */
export function summarizeByParticipant(spendings: Spending[], members: AppUser[] | null, currentUserId: number | null): ParticipantShare[] {
  const byUser = new Map<number, Omit<ParticipantShare, 'share' | 'color'>>();

  for (const m of members ?? []) {
    byUser.set(m.id, { userId: m.id, name: fullName(m), photoUrl: m.googlePhotoAddress || null, isYou: m.id === currentUserId, spent: 0, count: 0 });
  }

  for (const sp of spendings) {
    if (sp.amount >= 0) continue;
    let entry = byUser.get(sp.createdByUserId);
    if (!entry) {
      entry = {
        userId: sp.createdByUserId,
        name: sp.createdByName?.trim() || sp.createdByEmail || 'Former member',
        photoUrl: null,
        isYou: sp.createdByUserId === currentUserId,
        spent: 0,
        count: 0,
      };
      byUser.set(sp.createdByUserId, entry);
    }
    entry.spent += -sp.amount;
    entry.count += 1;
  }

  const total = [...byUser.values()].reduce((sum, p) => sum + p.spent, 0);

  // Colours follow a stable order (by user id) so a person keeps their colour across periods.
  const colorById = new Map([...byUser.keys()].sort((a, b) => a - b).map((id, i) => [id, PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length]]));

  return [...byUser.values()]
    .map(p => ({ ...p, share: total === 0 ? 0 : (p.spent / total) * 100, color: colorById.get(p.userId)! }))
    .sort((a, b) => b.spent - a.spent || Number(b.isYou) - Number(a.isYou));
}

export function initials(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
