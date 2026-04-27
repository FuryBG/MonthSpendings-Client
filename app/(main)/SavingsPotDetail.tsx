// --- FILE: app/(main)/SavingsPotDetail.tsx ---
import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { ScreenContainer } from '@/components/ScreenContainer';
import {
  useAddContributionMutation,
  useDeleteSavingsPotMutation,
  useRemoveContributionMutation,
  useSavingsHistoryQuery,
  useSavingsPotsQuery,
  useSendSavingsPotInviteMutation,
} from '@/hooks/useSavingsQueries';
import { useAuthStore } from '@/stores/authStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { MonthlyContributionDto, SavingsContribution } from '@/types/Types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  HelperText,
  Icon,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

const C_SAVINGS = '#4ADE80';
const C_AMBER = '#F59E0B';
const C_EXPENSE = '#F87171';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const AVATAR_COLORS = ['#4ADE80', '#F59E0B', '#60A5FA', '#F87171', '#C084FC', '#34D399', '#FB923C'];

function avatarColor(userId: number): string {
  return AVATAR_COLORS[Math.abs(userId) % AVATAR_COLORS.length];
}

function avatarInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type SheetType = 'addFunds' | 'invite' | 'deletePot' | null;
type FundsForm = { amount: string; note: string };
type InviteForm = { email: string };

// ─── Contribution Row ─────────────────────────────────────────────────────────

function ContributionRow({
  contribution,
  sym,
  onDelete,
  onSurface,
  surfaceVariant,
}: {
  contribution: SavingsContribution;
  sym: string;
  onDelete: () => void;
  onSurface: string;
  surfaceVariant: string;
}) {
  const name = contribution.addedByName ?? contribution.addedByEmail ?? 'Someone';

  return (
    <View style={[contStyles.row, { borderBottomColor: surfaceVariant }]}>
      <View style={[contStyles.avatar, { backgroundColor: `${avatarColor(contribution.addedByUserId)}28` }]}>
        <Text style={[contStyles.avatarText, { color: avatarColor(contribution.addedByUserId) }]}>
          {avatarInitials(contribution.addedByName, contribution.addedByEmail ?? 'U')}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={contStyles.topLine}>
          <Text style={[contStyles.name, { color: onSurface }]}>{name}</Text>
          <Text style={[contStyles.amount, { color: C_AMBER }]}>
            +{sym}{contribution.amount.toFixed(2)}
          </Text>
        </View>
        <View style={contStyles.bottomLine}>
          <Text style={[contStyles.date, { color: onSurface }]}>{fmtDate(contribution.date)}</Text>
          {contribution.note ? (
            <Text style={[contStyles.note, { color: onSurface }]} numberOfLines={1}>
              · {contribution.note}
            </Text>
          ) : null}
        </View>
      </View>
      <IconButton
        icon="trash-can-outline"
        size={16}
        iconColor={C_EXPENSE}
        onPress={onDelete}
        style={contStyles.deleteBtn}
      />
    </View>
  );
}

const contStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700' },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 13, fontWeight: '600' },
  amount: { fontSize: 13, fontWeight: '700' },
  bottomLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  date: { fontSize: 11, opacity: 0.45 },
  note: { fontSize: 11, opacity: 0.45, flex: 1 },
  deleteBtn: { margin: 0 },
});

// ─── Month Section ────────────────────────────────────────────────────────────

function MonthSection({
  month,
  sym,
  onDelete,
  onSurface,
  onSurfaceVariant,
  surfaceVariant,
}: {
  month: MonthlyContributionDto;
  sym: string;
  onDelete: (id: number) => void;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceVariant: string;
}) {
  return (
    <View>
      <View style={[monthStyles.header, { borderBottomColor: surfaceVariant }]}>
        <Text style={[monthStyles.title, { color: onSurfaceVariant }]}>
          {MONTH_NAMES[month.month - 1]} {month.year}
        </Text>
        <Text style={[monthStyles.total, { color: C_SAVINGS }]}>
          +{sym}{month.total.toFixed(0)}
        </Text>
      </View>
      {month.contributions.map((c) => (
        <ContributionRow
          key={c.id}
          contribution={c}
          sym={sym}
          onDelete={() => onDelete(c.id)}
          onSurface={onSurface}
          surfaceVariant={surfaceVariant}
        />
      ))}
    </View>
  );
}

const monthStyles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, opacity: 0.55, textTransform: 'uppercase' },
  total: { fontSize: 13, fontWeight: '700' },
});

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SavingsPotDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { potId: potIdParam } = useLocalSearchParams<{ potId: string }>();
  const potId = Number(potIdParam) || 0;

  const user = useAuthStore((s) => s.user);
  const showError = useSnackbarStore((s) => s.showError);

  const { data: pots = [] } = useSavingsPotsQuery();
  const { data: history, isLoading: historyLoading } = useSavingsHistoryQuery(potId);

  const addMutation = useAddContributionMutation(potId, { skipGlobalError: true });
  const removeMutation = useRemoveContributionMutation(potId, { skipGlobalError: true });
  const deletePotMutation = useDeleteSavingsPotMutation({ skipGlobalError: true });
  const inviteMutation = useSendSavingsPotInviteMutation({ skipGlobalError: true });

  const sheetRef = useRef<BottomSheetRef>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [loading, setLoading] = useState(false);

  const { control: fundsControl, handleSubmit: fundsSubmit, reset: fundsReset } = useForm<FundsForm>({
    defaultValues: { amount: '', note: '' },
  });
  const { control: inviteControl, handleSubmit: inviteSubmit, reset: inviteReset } = useForm<InviteForm>({
    defaultValues: { email: '' },
  });

  const pot = pots.find((p) => p.id == potId);
  const sym = pot?.currency?.symbol ?? '€';
  const isOwner = user?.id === pot?.createdByUserId;

  function openSheet(type: SheetType) {
    setActiveSheet(type);
    setSheetVisible(true);
  }

  function handleClose(onDone?: () => void) {
    setSheetVisible(false);
    setActiveSheet(null);
    onDone?.();
  }

  async function onAddFunds({ amount, note }: FundsForm) {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    try {
      setLoading(true);
      await addMutation.mutateAsync({ amount: parsed, note: note.trim() || null });
      sheetRef.current?.close(fundsReset);
    } catch {
      showError('Failed to add funds.');
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteContribution(contributionId: number) {
    try {
      await removeMutation.mutateAsync(contributionId);
    } catch {
      showError('Failed to remove contribution.');
    }
  }

  async function onSendInvite({ email }: InviteForm) {
    try {
      setLoading(true);
      await inviteMutation.mutateAsync({ savingsPotId: potId, receiverEmail: email.trim() });
      sheetRef.current?.close(inviteReset);
    } catch {
      showError('Failed to send invite. Make sure the user exists.');
    } finally {
      setLoading(false);
    }
  }

  async function onDeletePot() {
    try {
      setLoading(true);
      await deletePotMutation.mutateAsync(potId);
      sheetRef.current?.close(() => router.back());
    } catch {
      showError('Failed to delete savings pot.');
    } finally {
      setLoading(false);
    }
  }

  function renderSheet() {
    if (activeSheet === 'addFunds') {
      return (
        <>
          <Text style={sheetStyles.sheetTitle}>Add Funds</Text>
          <Controller
            control={fundsControl}
            rules={{ required: 'Amount is required', validate: (v) => parseFloat(v) > 0 || 'Must be greater than 0' }}
            name="amount"
            render={({ field: { onChange, value }, fieldState }) => (
              <>
                <TextInput
                  label={`Amount (${sym})`}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                  error={!!fieldState.error}
                  style={sheetStyles.sheetInput}
                  autoFocus
                />
                <HelperText type="error" visible={!!fieldState.error}>{fieldState.error?.message}</HelperText>
              </>
            )}
          />
          <Controller
            control={fundsControl}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Note (optional)"
                value={value}
                onChangeText={onChange}
                style={sheetStyles.sheetInput}
              />
            )}
          />
          <View style={sheetStyles.sheetActions}>
            <Button mode="text" onPress={() => sheetRef.current?.close(fundsReset)}>Cancel</Button>
            <Button
              mode="contained"
              loading={loading}
              onPress={fundsSubmit(onAddFunds)}
              buttonColor={C_SAVINGS}
              textColor="#0C0E12"
              contentStyle={sheetStyles.sheetConfirmContent}
            >
              Add
            </Button>
          </View>
        </>
      );
    }

    if (activeSheet === 'invite') {
      return (
        <>
          <Text style={sheetStyles.sheetTitle}>Invite Member</Text>
          <Controller
            control={inviteControl}
            rules={{ required: 'Email is required' }}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <>
                <TextInput
                  label="Email address"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!fieldState.error}
                  style={sheetStyles.sheetInput}
                  autoFocus
                />
                <HelperText type="error" visible={!!fieldState.error}>{fieldState.error?.message}</HelperText>
              </>
            )}
          />
          <View style={sheetStyles.sheetActions}>
            <Button mode="text" onPress={() => sheetRef.current?.close(inviteReset)}>Cancel</Button>
            <Button
              mode="contained"
              loading={loading}
              onPress={inviteSubmit(onSendInvite)}
              contentStyle={sheetStyles.sheetConfirmContent}
            >
              Send Invite
            </Button>
          </View>
        </>
      );
    }

    if (activeSheet === 'deletePot') {
      return (
        <View style={sheetStyles.sheetCenteredContent}>
          <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: 'rgba(248,113,113,0.12)' }]}>
            <Icon source="trash-can-outline" size={28} color={C_EXPENSE} />
          </View>
          <Text style={sheetStyles.sheetConfirmTitle}>Delete Savings Pot</Text>
          <Text style={sheetStyles.sheetConfirmDesc}>
            Permanently delete "{pot?.name}"? All contributions and history will be lost. This cannot be undone.
          </Text>
          <View style={sheetStyles.sheetActions}>
            <Button mode="text" onPress={() => sheetRef.current?.close()}>Cancel</Button>
            <Button
              mode="contained"
              buttonColor={C_EXPENSE}
              textColor="#fff"
              loading={loading}
              onPress={onDeletePot}
              contentStyle={sheetStyles.sheetConfirmContent}
            >
              Delete
            </Button>
          </View>
        </View>
      );
    }

    return null;
  }

  if (!pot) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C_SAVINGS} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer scrollable>

        {/* ── HERO CARD ── */}
        <Card style={[styles.heroCard, { borderColor: `${C_SAVINGS}30` }]}>
          <Card.Content>
            <View style={styles.heroTop}>
              <Text style={[styles.heroName, { color: theme.colors.onSurface }]}>{pot.name}</Text>
              <View style={[styles.heroCurrencyPill, { backgroundColor: `${theme.colors.primary}18` }]}>
                <Text style={[styles.heroCurrencyText, { color: theme.colors.primary }]}>
                  {pot.currency.code}
                </Text>
              </View>
            </View>
            <Text style={[styles.heroLabel, { color: theme.colors.onSurfaceVariant }]}>TOTAL SAVED</Text>
            <Text style={[styles.heroAmount, { color: C_SAVINGS }]}>
              {sym}{history?.runningTotal.toFixed(2) ?? pot.totalSaved.toFixed(2)}
            </Text>

            {/* Members row */}
            <View style={styles.membersRow}>
              {pot.users.map((u) => {
                const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
                return (
                  <View
                    key={u.id}
                    style={[styles.memberAvatar, { backgroundColor: `${avatarColor(u.id)}28` }]}
                  >
                    <Text style={[styles.memberAvatarText, { color: avatarColor(u.id) }]}>
                      {avatarInitials(name || null, u.email)}
                    </Text>
                  </View>
                );
              })}
              <TouchableOpacity
                style={[styles.memberAvatarAdd, { borderColor: theme.colors.primary }]}
                onPress={() => openSheet('invite')}
              >
                <Icon source="plus" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* ── ACTION BUTTONS ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: `${C_SAVINGS}18`, borderColor: `${C_SAVINGS}40` }]}
            onPress={() => openSheet('addFunds')}
          >
            <Icon source="plus-circle-outline" size={18} color={C_SAVINGS} />
            <Text style={[styles.actionBtnText, { color: C_SAVINGS }]}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: `${theme.colors.primary}0F`, borderColor: `${theme.colors.primary}30` }]}
            onPress={() => openSheet('invite')}
          >
            <Icon source="account-plus-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* ── HISTORY ── */}
        <Card style={styles.historyCard}>
          <Card.Content style={styles.historyContent}>
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>CONTRIBUTION HISTORY</Text>
            <Divider style={styles.divider} />

            {historyLoading ? (
              <View style={styles.historyLoader}>
                <ActivityIndicator size="small" color={C_SAVINGS} />
              </View>
            ) : !history || history.months.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Icon source="piggy-bank-outline" size={28} color={C_SAVINGS} />
                <Text style={[styles.emptyHistoryText, { color: theme.colors.onSurfaceVariant }]}>
                  No contributions yet — add the first one!
                </Text>
              </View>
            ) : (
              history.months.map((month) => (
                <MonthSection
                  key={`${month.year}-${month.month}`}
                  month={month}
                  sym={sym}
                  onDelete={onDeleteContribution}
                  onSurface={theme.colors.onSurface}
                  onSurfaceVariant={theme.colors.onSurfaceVariant}
                  surfaceVariant={theme.colors.surfaceVariant}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* ── DELETE (creator only) ── */}
        {isOwner && (
          <View style={styles.deleteSection}>
            <Divider style={{ marginBottom: 4 }} />
            <TouchableOpacity style={styles.deleteRow} onPress={() => openSheet('deletePot')}>
              <View style={[styles.deleteIconWrap, { backgroundColor: 'rgba(248,113,113,0.1)' }]}>
                <Icon source="trash-can-outline" size={18} color={C_EXPENSE} />
              </View>
              <View>
                <Text style={[styles.deleteLabel, { color: C_EXPENSE }]}>Delete Savings Pot</Text>
                <Text style={[styles.deleteSub, { color: theme.colors.onSurfaceVariant }]}>
                  Removes all contributions and history
                </Text>
              </View>
              <Icon source="chevron-right" size={18} color={C_EXPENSE} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScreenContainer>

      <BottomSheet ref={sheetRef} visible={sheetVisible} onClose={handleClose}>
        {renderSheet()}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroCard: { borderRadius: 20, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroName: { fontSize: 20, fontWeight: '700', flex: 1 },
  heroCurrencyPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  heroCurrencyText: { fontSize: 12, fontWeight: '700' },
  heroLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, opacity: 0.5, marginBottom: 2 },
  heroAmount: { fontSize: 38, fontWeight: '800', letterSpacing: -1, marginBottom: 16 },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { fontSize: 12, fontWeight: '700' },
  memberAvatarAdd: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, borderWidth: 1, paddingVertical: 12 },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
  historyCard: { borderRadius: 20, marginBottom: 12, overflow: 'hidden' },
  historyContent: { paddingHorizontal: 0, paddingBottom: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, opacity: 0.4, paddingHorizontal: 16, paddingTop: 4, marginBottom: 4 },
  divider: { marginBottom: 0 },
  historyLoader: { paddingVertical: 24, alignItems: 'center' },
  emptyHistory: { paddingVertical: 24, alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  emptyHistoryText: { fontSize: 13, textAlign: 'center', opacity: 0.6, lineHeight: 18 },
  deleteSection: { marginBottom: 8 },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 4 },
  deleteIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  deleteLabel: { fontSize: 15, fontWeight: '600' },
  deleteSub: { fontSize: 12, opacity: 0.5, marginTop: 1 },
});
