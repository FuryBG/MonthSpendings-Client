import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Tavira } from '@/constants/theme';
import { useConnectedBanksQuery, useDeleteBankConsentMutation } from '@/hooks/useConnectedBankQueries';
import { useSyncTransactionsMutation } from '@/hooks/useBankTransactionQueries';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { useTitleStore } from '@/stores/titleStore';
import { BankConsentDto } from '@/types/Types';
import { useFocusEffect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getExpiryInfo(consent: BankConsentDto): { label: string; color: string; bg: string; border: string } {
  if (consent.state === 'Expired' || consent.state === 'ConnectionFailed') {
    return { label: consent.state === 'Expired' ? 'Expired' : 'Connection failed', color: Tavira.expense, bg: 'rgba(255,107,107,0.10)', border: 'rgba(255,107,107,0.25)' };
  }

  const validTo = new Date(consent.validTo);
  const now = new Date();
  const daysLeft = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return { label: 'Expired', color: Tavira.expense, bg: 'rgba(255,107,107,0.10)', border: 'rgba(255,107,107,0.25)' };
  }
  if (daysLeft <= 7) {
    return { label: `Expires in ${daysLeft}d`, color: '#E0A43A', bg: 'rgba(224,164,58,0.10)', border: 'rgba(224,164,58,0.25)' };
  }
  return { label: `Valid until ${formatDate(consent.validTo)}`, color: Tavira.teal, bg: 'rgba(62,198,198,0.10)', border: 'rgba(62,198,198,0.22)' };
}

function EmptyState({ isDark, onConnect }: { isDark: boolean; onConnect: () => void }) {
  const theme = useTheme();
  return (
    <View style={s.emptyContainer}>
      <View style={[s.emptyIconWrap, {
        backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant,
        borderColor: isDark ? 'rgba(62,198,198,0.2)' : 'transparent',
        borderWidth: 1,
      }]}>
        <Icon source="bank-off-outline" size={36} color={isDark ? Tavira.teal : theme.colors.primary} />
      </View>
      <Text style={[s.emptyTitle, { color: theme.colors.onSurface }]}>No banks connected yet</Text>
      <Text style={[s.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Connect a bank account to automatically import transactions.
      </Text>
      <TouchableOpacity style={s.connectBtn} onPress={onConnect} activeOpacity={0.85}>
        <Icon source="bank-plus" size={16} color={Tavira.navy} />
        <Text style={s.connectBtnText}>Connect a Bank</Text>
      </TouchableOpacity>
    </View>
  );
}

type CardProps = { item: BankConsentDto; isDark: boolean; onDelete: (item: BankConsentDto) => void };

function BankCard({ item, isDark, onDelete }: CardProps) {
  const theme = useTheme();
  const expiry = getExpiryInfo(item);

  return (
    <View style={[s.card, {
      backgroundColor: isDark ? Tavira.glassBg : '#FFFFFF',
      borderColor: isDark ? Tavira.glassBorder : 'rgba(11,27,58,0.08)',
    }]}>
      <View style={s.cardHeader}>
        <View style={s.logoWrap}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} resizeMode="contain" style={s.logo} />
          ) : (
            <Icon source="bank-outline" size={22} color={Tavira.teal} />
          )}
        </View>
        <View style={s.cardMeta}>
          <Text style={[s.bankName, { color: isDark ? '#F2F4F8' : Tavira.navy }]} numberOfLines={1}>
            {item.bankName}
          </Text>
          <View style={[s.expiryBadge, { backgroundColor: expiry.bg, borderColor: expiry.border }]}>
            <Text style={[s.expiryText, { color: expiry.color }]}>{expiry.label}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.deleteBtn} onPress={() => onDelete(item)} activeOpacity={0.7}>
          <Icon source="trash-can-outline" size={18} color={Tavira.expense} />
        </TouchableOpacity>
      </View>

      {item.bankAccounts.length > 0 && (
        <View style={[s.accountsList, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.outlineVariant }]}>
          {item.bankAccounts.map((account) => (
            <View key={account.id} style={s.accountRow}>
              <Icon source="credit-card-outline" size={15} color={isDark ? 'rgba(242,244,248,0.4)' : theme.colors.onSurfaceVariant} />
              <View style={s.accountMeta}>
                <Text style={[s.accountIban, { color: isDark ? '#F2F4F8' : Tavira.navy }]} numberOfLines={1}>
                  {account.iban}
                </Text>
                {account.holderName ? (
                  <Text style={[s.accountHolder, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                    {account.holderName}
                  </Text>
                ) : null}
              </View>
              <View style={[s.currencyBadge, {
                backgroundColor: isDark ? 'rgba(91,123,255,0.15)' : theme.colors.surfaceVariant,
                borderColor: isDark ? 'rgba(91,123,255,0.25)' : 'transparent',
                borderWidth: 1,
              }]}>
                <Text style={[s.currencyText, { color: isDark ? Tavira.purple : theme.colors.onSurfaceVariant }]}>
                  {account.currency}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ConnectedBanks() {
  const { data: connectedBanks = [], isLoading } = useConnectedBanksQuery();
  const deleteMutation = useDeleteBankConsentMutation();
  const syncMutation = useSyncTransactionsMutation();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const setTitle = useTitleStore((s) => s.setTitle);
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;
  const sheetRef = useRef<BottomSheetRef>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<BankConsentDto | null>(null);

  useFocusEffect(() => { setTitle('Connected Banks'); });

  function onDelete(consent: BankConsentDto) {
    setSelectedConsent(consent);
    setSheetVisible(true);
  }

  function handleSheetClose(onDone?: () => void) {
    setSheetVisible(false);
    onDone?.();
  }

  async function onConfirmDelete() {
    if (!selectedConsent) return;
    try {
      await deleteMutation.mutateAsync(selectedConsent.sessionId);
      sheetRef.current?.close(() => { setSelectedConsent(null); showSuccess('Bank connection removed.'); });
    } catch {
      sheetRef.current?.close(() => showError('Failed to remove bank connection.'));
    }
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? Tavira.teal : theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer scrollable={false} glowColor="purple">
        <View style={s.syncRow}>
          <TouchableOpacity
            style={[s.syncBtn, syncMutation.isPending && s.syncBtnDisabled]}
            onPress={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            activeOpacity={0.75}
          >
            {syncMutation.isPending
              ? <ActivityIndicator size="small" color={Tavira.navy} />
              : <Icon source="sync" size={15} color={Tavira.navy} />}
            <Text style={s.syncBtnText}>Sync transactions</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={connectedBanks}
          keyExtractor={(item) => `${item.id}`}
          contentContainerStyle={[s.list, connectedBanks.length === 0 && s.listEmpty]}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState isDark={isDark} onConnect={() => router.push('/(main)/ConnectBank')} />}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          renderItem={({ item }) => (
            <BankCard item={item} isDark={isDark} onDelete={onDelete} />
          )}
        />
      </ScreenContainer>

      <BottomSheet ref={sheetRef} visible={sheetVisible} onClose={handleSheetClose}>
        <View style={sheetStyles.sheetCenteredContent}>
          <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: 'rgba(248,113,113,0.12)' }]}>
            <Icon source="bank-off-outline" size={28} color={Tavira.expense} />
          </View>
          <Text style={sheetStyles.sheetConfirmTitle}>Remove Bank Connection</Text>
          <Text style={sheetStyles.sheetConfirmDesc}>
            This will remove {selectedConsent?.bankName} and stop syncing its transactions. This can&apos;t be undone.
          </Text>
          <View style={sheetStyles.sheetActions}>
            <Button mode="text" onPress={() => sheetRef.current?.close()}>Cancel</Button>
            <Button mode="contained" buttonColor={Tavira.expense} textColor="#fff"
              loading={deleteMutation.isPending} onPress={onConfirmDelete}
              contentStyle={sheetStyles.sheetConfirmContent}>
              Remove
            </Button>
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  syncRow: { alignItems: 'flex-end', paddingTop: 4, paddingBottom: 8 },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Tavira.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  syncBtnDisabled: { opacity: 0.6 },
  syncBtnText: { color: Tavira.navy, fontWeight: '700', fontSize: 13 },
  list: { paddingTop: 8, paddingBottom: 32 },
  listEmpty: { flex: 1 },
  separator: { height: 10 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 5,
  },
  logo: { width: '100%', height: '100%' },
  cardMeta: { flex: 1, gap: 5 },
  bankName: { fontSize: 14, fontWeight: '700', letterSpacing: 0.1 },
  expiryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 7, borderWidth: 1 },
  expiryText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  accountsList: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountMeta: { flex: 1, gap: 2 },
  accountIban: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  accountHolder: { fontSize: 11 },
  currencyBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 7 },
  currencyText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingHorizontal: 32 },
  emptyIconWrap: { width: 84, height: 84, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 19, fontWeight: '700' },
  emptySubtitle: { textAlign: 'center', lineHeight: 20, fontSize: 13 },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Tavira.teal,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  connectBtnText: { color: Tavira.navy, fontWeight: '700', fontSize: 13 },
});
