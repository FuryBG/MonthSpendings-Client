// --- FILE: app/(main)/SavingsPots.tsx ---
import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { ScreenContainer } from '@/components/ScreenContainer';
import { getCurrencies } from '@/app/services/api';
import { useCreateSavingsPotMutation, useSavingsPotsQuery } from '@/hooks/useSavingsQueries';
import { useAuthStore } from '@/stores/authStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { Currency, SavingsPot } from '@/types/Types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Button,
  Card,
  FAB,
  HelperText,
  Icon,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

const C_SAVINGS = '#4ADE80';
const C_AMBER = '#F59E0B';

type CreateForm = { name: string };

// ─── Pot Card ────────────────────────────────────────────────────────────────

function PotCard({
  pot,
  isOwner,
  onPress,
}: {
  pot: SavingsPot;
  isOwner: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const last = pot.recentContributions[0];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78}>
      <Card style={styles.potCard}>
        <Card.Content>
          {/* top row */}
          <View style={styles.cardTopRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.potName, { color: theme.colors.onSurface }]}>{pot.name}</Text>
              {isOwner && (
                <View style={styles.ownerBadge}>
                  <Icon source="crown-outline" size={11} color={C_AMBER} />
                  <Text style={[styles.ownerText, { color: C_AMBER }]}>Created by you</Text>
                </View>
              )}
            </View>
            <View style={[styles.currencyPill, { backgroundColor: `${theme.colors.primary}18` }]}>
              <Text style={[styles.currencyPillText, { color: theme.colors.primary }]}>
                {pot.currency.code}
              </Text>
            </View>
          </View>

          {/* total saved */}
          <View style={styles.cardMidRow}>
            <View>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>TOTAL SAVED</Text>
              <Text style={[styles.totalAmount, { color: C_SAVINGS }]}>
                {pot.currency.symbol}{pot.totalSaved.toFixed(2)}
              </Text>
            </View>
            <View style={styles.membersChip}>
              <Icon source="account-group-outline" size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.membersText, { color: theme.colors.onSurfaceVariant }]}>
                {pot.users.length}
              </Text>
            </View>
          </View>

          {/* last activity */}
          {last && (
            <View style={[styles.lastRow, { borderTopColor: theme.colors.surfaceVariant }]}>
              <Icon source="clock-outline" size={11} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.lastText, { color: theme.colors.onSurfaceVariant }]}>
                +{pot.currency.symbol}{last.amount.toFixed(0)} by {last.addedByName ?? 'someone'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SavingsPotsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const { data: pots = [], isLoading } = useSavingsPotsQuery();
  const { data: currencies = [] } = useQuery({ queryKey: ['currencies'], queryFn: getCurrencies });
  const createMutation = useCreateSavingsPotMutation({ skipGlobalError: true });

  const sheetRef = useRef<BottomSheetRef>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [step, setStep] = useState<'name' | 'currency'>('name');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, getValues } = useForm<CreateForm>({
    defaultValues: { name: '' },
  });

  function openCreate() {
    setStep('name');
    setSelectedCurrency(null);
    reset();
    setSheetVisible(true);
  }

  function handleClose(onDone?: () => void) {
    setSheetVisible(false);
    setStep('name');
    onDone?.();
  }

  async function onSubmit() {
    if (!selectedCurrency) return;
    try {
      setSubmitting(true);
      await createMutation.mutateAsync({ name: getValues('name'), currency: selectedCurrency });
      sheetRef.current?.close(() => { reset(); setSelectedCurrency(null); setStep('name'); showSuccess('Savings pot created.'); });
    } catch {
      sheetRef.current?.close(() => showError('Failed to create savings pot.'));
    } finally {
      setSubmitting(false);
    }
  }

  function renderSheet() {
    if (step === 'name') {
      return (
        <>
          <Text style={sheetStyles.sheetTitle}>New Savings Pot</Text>
          <Controller
            control={control}
            rules={{ required: 'Name is required' }}
            name="name"
            render={({ field: { onChange, value }, fieldState }) => (
              <>
                <TextInput
                  label="Pot name"
                  value={value}
                  onChangeText={onChange}
                  error={!!fieldState.error}
                  style={sheetStyles.sheetInput}
                  autoFocus
                />
                <HelperText type="error" visible={!!fieldState.error}>
                  {fieldState.error?.message}
                </HelperText>
              </>
            )}
          />
          <View style={sheetStyles.sheetActions}>
            <Button mode="text" onPress={() => sheetRef.current?.close(reset)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSubmit(() => setStep('currency'))}
              contentStyle={sheetStyles.sheetConfirmContent}
            >
              Next
            </Button>
          </View>
        </>
      );
    }

    return (
      <>
        <Text style={sheetStyles.sheetTitle}>Choose Currency</Text>
        <ScrollView style={styles.currencyScroll} showsVerticalScrollIndicator={false}>
          {currencies.slice(0, 15).map((c) => {
            const selected = selectedCurrency?.id === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.currencyRow,
                  { borderColor: selected ? C_SAVINGS : theme.colors.surfaceVariant },
                  selected && { backgroundColor: `${C_SAVINGS}14` },
                ]}
                onPress={() => setSelectedCurrency(c)}
              >
                <Text style={[styles.currencySymbol, { color: selected ? C_SAVINGS : theme.colors.primary }]}>
                  {c.symbol}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.currencyCode, { color: theme.colors.onSurface }]}>{c.code}</Text>
                  <Text style={[styles.currencyName, { color: theme.colors.onSurfaceVariant }]}>{c.name}</Text>
                </View>
                {selected && <Icon source="check-circle" size={18} color={C_SAVINGS} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={sheetStyles.sheetActions}>
          <Button mode="text" onPress={() => setStep('name')}>Back</Button>
          <Button
            mode="contained"
            loading={submitting}
            disabled={!selectedCurrency}
            onPress={onSubmit}
            buttonColor={C_SAVINGS}
            textColor="#0C0E12"
            contentStyle={sheetStyles.sheetConfirmContent}
          >
            Create
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <ScreenContainer scrollable={pots.length > 0} topEdge>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={C_SAVINGS} />
            </View>
          ) : pots.length === 0 ? (
            <View style={styles.center}>
              <View style={[styles.emptyIconWrap, { backgroundColor: `${C_SAVINGS}14` }]}>
                <Icon source="piggy-bank-outline" size={40} color={C_SAVINGS} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No Savings Pots Yet</Text>
              <Text style={[styles.emptySub, { color: theme.colors.onSurfaceVariant }]}>
                Create your first pot to start tracking money you're setting aside — share it with others too.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {pots.map((pot) => (
                <PotCard
                  key={pot.id}
                  pot={pot}
                  isOwner={user?.id === pot.createdByUserId}
                  onPress={() =>
                    router.push({ pathname: '/(main)/SavingsPotDetail', params: { potId: pot.id } })
                  }
                />
              ))}
              <View style={{ height: 96 }} />
            </View>
          )}
        </ScreenContainer>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: C_SAVINGS, bottom: 16 + insets.bottom }]}
          color="#0C0E12"
          onPress={openCreate}
        />
      </View>

      <BottomSheet ref={sheetRef} visible={sheetVisible} onClose={handleClose}>
        {renderSheet()}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.65 },
  list: { paddingTop: 4, gap: 12 },
  potCard: { borderRadius: 18, overflow: 'hidden' },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  potName: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  ownerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ownerText: { fontSize: 11, fontWeight: '600' },
  currencyPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  currencyPillText: { fontSize: 12, fontWeight: '700' },
  cardMidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  totalLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, opacity: 0.5, marginBottom: 2 },
  totalAmount: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  membersChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  membersText: { fontSize: 12, opacity: 0.55 },
  lastRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  lastText: { fontSize: 11, opacity: 0.5 },
  fab: { position: 'absolute', right: 16, borderRadius: 16 },
  currencyScroll: { maxHeight: 220, marginBottom: 4 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  currencySymbol: { fontSize: 18, fontWeight: '700', width: 28, textAlign: 'center' },
  currencyCode: { fontSize: 14, fontWeight: '600' },
  currencyName: { fontSize: 12, opacity: 0.55 },
});
