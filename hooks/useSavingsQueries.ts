import {
  addSavingsContribution,
  createSavingsPot,
  deleteSavingsPot,
  getSavingsHistory,
  getSavingsPots,
  removeSavingsContribution,
  respondToSavingsPotInvite,
  sendSavingsPotInvite,
} from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { SavingsContribution, SavingsPot, SavingsPotInvite } from '@/types/Types';
import { MutationMeta, useMutation, useQuery } from '@tanstack/react-query';

export const useSavingsPotsQuery = () =>
  useQuery({
    queryKey: ['savings'],
    queryFn: getSavingsPots,
  });

export const useSavingsHistoryQuery = (potId: number | null) =>
  useQuery({
    queryKey: ['savings-history', potId],
    queryFn: () => getSavingsHistory(potId!),
    enabled: potId != null,
  });

export const useCreateSavingsPotMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: (pot: Pick<SavingsPot, 'name' | 'currency'>) => createSavingsPot(pot),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savings'] }),
    meta,
  });

export const useDeleteSavingsPotMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: (potId: number) => deleteSavingsPot(potId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savings'] }),
    meta,
  });

export const useAddContributionMutation = (potId: number, meta?: MutationMeta) =>
  useMutation({
    mutationFn: (dto: Pick<SavingsContribution, 'amount' | 'note'>) => addSavingsContribution(potId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['savings-history', potId] });
    },
    meta,
  });

export const useRemoveContributionMutation = (potId: number, meta?: MutationMeta) =>
  useMutation({
    mutationFn: (contributionId: number) => removeSavingsContribution(potId, contributionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['savings-history', potId] });
    },
    meta,
  });

export const useSendSavingsPotInviteMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: (invite: Pick<SavingsPotInvite, 'savingsPotId' | 'receiverEmail'>) =>
      sendSavingsPotInvite(invite),
    meta,
  });

export const useRespondToSavingsPotInviteMutation = (meta?: MutationMeta) =>
  useMutation({
    mutationFn: ({ inviteId, accepted }: { inviteId: number; accepted: boolean }) =>
      respondToSavingsPotInvite(inviteId, accepted),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savings'] }),
    meta,
  });
