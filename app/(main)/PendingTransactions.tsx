import { Modal, ModalRef } from '@/components/Modal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Tavira } from '@/constants/theme';
import { useCategorizeTransactionMutation, usePendingTransactionsQuery } from '@/hooks/useBankTransactionQueries';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { useTitleStore } from '@/stores/titleStore';
import { BankTransaction, Budget, BudgetCategory } from '@/types/Types';
import { useFocusEffect } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { Chip, Icon, Text, useTheme } from 'react-native-paper';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}

function getAmountDisplay(amount: string) {
  const value = Math.abs(Number(amount));
  const isNegative = Number(amount) < 0;
  return {
    color: isNegative ? Tavira.expense : Tavira.income,
    sign: isNegative ? '−' : '+',
    value: value.toFixed(2),
  };
}

function EmptyState() {
  const theme = useTheme();
  const isDark = theme.dark;
  return (
    <View style={s.emptyContainer}>
      <View style={[s.emptyIconWrap, {
        backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant,
        borderColor: isDark ? 'rgba(62,198,198,0.2)' : 'transparent',
        borderWidth: 1,
      }]}>
        <Icon source="bank-check-outline" size={36} color={isDark ? Tavira.teal : theme.colors.primary} />
      </View>
      <Text style={[s.emptyTitle, { color: theme.colors.onSurface }]}>All caught up</Text>
      <Text style={[s.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        No transactions waiting to be categorized.{'\n'}New bank imports will appear here automatically.
      </Text>
    </View>
  );
}

type CardProps = { item: BankTransaction; onCategorize: (t: BankTransaction) => void };

function TransactionCard({ item, onCategorize }: CardProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const hasCreditor = !!item.creditorName;
  const hasDescription = !!item.description;

  return (
    <View style={[s.card, {
      backgroundColor: isDark ? Tavira.glassBg : '#FFFFFF',
      borderColor: isDark ? Tavira.glassBorder : 'rgba(11,27,58,0.08)',
    }]}>
      <View style={s.cardRow}>
        <View style={[s.iconWrap, { backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant }]}>
          <Icon source="bank-outline" size={20} color={isDark ? Tavira.teal : theme.colors.onSurfaceVariant} />
        </View>
        <View style={s.cardMeta}>
          {hasCreditor && (
            <Text
              style={[s.creditorName, { color: isDark ? '#F2F4F8' : Tavira.navy }]}
              numberOfLines={1}
            >
              {item.creditorName}
            </Text>
          )}
          {hasDescription && (
            <Text
              style={[s.descriptionText, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          )}
          <Text style={[s.dateText, { color: theme.colors.onSurfaceVariant }]}>{formatDate(item.bookingDate)}</Text>
          <View style={[s.currencyBadge, {
            backgroundColor: isDark ? 'rgba(91,123,255,0.15)' : theme.colors.surfaceVariant,
            borderColor: isDark ? 'rgba(91,123,255,0.25)' : 'transparent',
            borderWidth: 1,
          }]}>
            <Text style={[s.currencyText, { color: isDark ? Tavira.purple : theme.colors.onSurfaceVariant }]}>
              {item.currency}
            </Text>
          </View>
        </View>
        {(() => {
          const { color, sign, value } = getAmountDisplay(item.amount);
          return <Text style={[s.amount, { color }]}>{sign}{value}</Text>;
        })()}
      </View>
      <View style={s.cardFooter}>
        <TouchableOpacity style={s.categorizeBtn} onPress={() => onCategorize(item)}>
          <Icon source="tag-outline" size={15} color={Tavira.navy} />
          <Text style={s.categorizeBtnText}>Categorize</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ModalBodyProps = {
  transaction: BankTransaction;
  budgets: Budget[];
  selectedBudget: Budget | null;
  selectedCategoryId: number;
  createRule: boolean;
  onSelectBudget: (b: Budget) => void;
  onSelectCategory: (c: BudgetCategory) => void;
  onToggleRule: (v: boolean) => void;
};

function CategorizeBody({
  transaction,
  budgets,
  selectedBudget,
  selectedCategoryId,
  createRule,
  onSelectBudget,
  onSelectCategory,
  onToggleRule,
}: ModalBodyProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const canAutoRule = !!(transaction.creditorName || transaction.description);

  return (
    <View>
      <View style={[s.summary, {
        backgroundColor: isDark ? 'rgba(255,107,107,0.08)' : theme.colors.surfaceVariant,
        borderColor: isDark ? 'rgba(255,107,107,0.2)' : 'transparent',
        borderWidth: 1,
      }]}>
        <View style={s.summaryRow}>
          <Text style={[s.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Amount</Text>
          {(() => {
            const { color, sign, value } = getAmountDisplay(transaction.amount);
            return (
              <Text style={[s.summaryAmount, { color }]}>
                {sign}{value} {transaction.currency}
              </Text>
            );
          })()}
        </View>
        <View style={[s.summaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.outlineVariant }]} />
        <Text style={[s.summaryDate, { color: theme.colors.onSurfaceVariant }]}>
          {formatDate(transaction.bookingDate)}
        </Text>
      </View>

      <Text style={[s.sectionLabel, { color: isDark ? 'rgba(242,244,248,0.5)' : theme.colors.onSurfaceVariant }]}>Budget</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {budgets.map(b => (
          <Chip
            key={b.id}
            selected={b.id === selectedBudget?.id}
            showSelectedOverlay
            mode={b.id === selectedBudget?.id ? 'flat' : 'outlined'}
            onPress={() => onSelectBudget(b)}
            style={s.chip}
          >
            {b.name}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[s.sectionLabel, { color: isDark ? 'rgba(242,244,248,0.5)' : theme.colors.onSurfaceVariant }]}>Category</Text>
      {selectedBudget ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
          {(selectedBudget.budgetCategories ?? []).map(c => (
            <Chip
              key={c.id}
              selected={c.id === selectedCategoryId}
              showSelectedOverlay
              mode={c.id === selectedCategoryId ? 'flat' : 'outlined'}
              onPress={() => onSelectCategory(c)}
              style={s.chip}
            >
              {c.name}
            </Chip>
          ))}
        </ScrollView>
      ) : (
        <Text style={[s.hint, { color: theme.colors.onSurfaceVariant }]}>Select a budget first</Text>
      )}

      {canAutoRule && (
        <>
          <View style={[s.ruleDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.outlineVariant }]} />
          <View style={[s.ruleRow, {
            backgroundColor: isDark
              ? createRule ? 'rgba(62,198,198,0.07)' : 'transparent'
              : createRule ? 'rgba(62,198,198,0.06)' : 'transparent',
            borderRadius: 12,
            padding: 4,
          }]}>
            <View style={s.ruleLabelGroup}>
              <View style={s.ruleTitleRow}>
                <Icon
                  source="lightning-bolt"
                  size={14}
                  color={createRule ? Tavira.teal : (isDark ? 'rgba(242,244,248,0.4)' : theme.colors.onSurfaceVariant)}
                />
                <Text style={[
                  s.ruleLabel,
                  { color: createRule ? (isDark ? Tavira.teal : '#0B9EA0') : (isDark ? 'rgba(242,244,248,0.8)' : theme.colors.onSurface) },
                ]}>
                  Auto-categorize similar
                </Text>
              </View>
              <Text style={[s.ruleHint, { color: isDark ? 'rgba(242,244,248,0.38)' : theme.colors.onSurfaceVariant }]}>
                Save this choice for future transactions from the same source
              </Text>
            </View>
            <Switch
              value={createRule}
              onValueChange={onToggleRule}
              trackColor={{
                false: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                true: 'rgba(62,198,198,0.45)',
              }}
              thumbColor={createRule ? Tavira.teal : (isDark ? 'rgba(255,255,255,0.6)' : '#f4f3f4')}
              ios_backgroundColor={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
            />
          </View>
        </>
      )}
    </View>
  );
}

export default function PendingTransactions() {
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: transactions = [], isLoading } = usePendingTransactionsQuery();
  const categorizeMutation = useCategorizeTransactionMutation();
  const setTitle = useTitleStore((s) => s.setTitle);
  const modalRef = useRef<ModalRef>(null);
  const theme = useTheme();
  const isDark = theme.dark;

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [createRule, setCreateRule] = useState<boolean>(false);

  useFocusEffect(() => { setTitle('Transactions'); });

  function onCategorize(transaction: BankTransaction) {
    setSelectedTransaction(transaction);
    setSelectedBudget(null);
    setSelectedCategoryId(0);
    setCreateRule(false);
    modalRef.current?.open();
  }

  async function onSave() {
    try {
      const t = selectedTransaction!;
      await categorizeMutation.mutateAsync({
        id: t.id,
        transactionId: t.transactionId,
        bankAccountId: Number(t.bankAccountId),
        currency: t.currency,
        amount: Number(t.amount),
        merchantCode: null,
        creditorName: t.creditorName ?? null,
        description: t.description ?? null,
        status: 'BOOK',
        bookingDate: t.bookingDate,
        categorized: false,
        categoryId: selectedCategoryId,
        createRule,
      });
      setSelectedTransaction(null);
      modalRef.current?.close();
    } catch {
      // global MutationCache shows Snackbar
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
      <ScreenContainer scrollable={false} glowColor="teal">
        <FlatList
          data={transactions}
          keyExtractor={(item) => `${item.id}`}
          contentContainerStyle={[s.list, transactions.length === 0 && s.listEmpty]}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          renderItem={({ item }) => (
            <TransactionCard item={item} onCategorize={onCategorize} />
          )}
        />
      </ScreenContainer>

      <Modal
        ref={modalRef}
        loading={categorizeMutation.isPending}
        title="Categorize Transaction"
        onSubmit={(cancelled: boolean) => (cancelled ? null : onSave())}
      >
        {selectedTransaction && (
          <CategorizeBody
            transaction={selectedTransaction}
            budgets={budgets}
            selectedBudget={selectedBudget}
            selectedCategoryId={selectedCategoryId}
            createRule={createRule}
            onSelectBudget={setSelectedBudget}
            onSelectCategory={(c) => setSelectedCategoryId(c.id)}
            onToggleRule={setCreateRule}
          />
        )}
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingTop: 8, paddingBottom: 32 },
  listEmpty: { flex: 1 },
  separator: { height: 10 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardMeta: { flex: 1, gap: 3 },
  creditorName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.1 },
  descriptionText: { fontSize: 11, lineHeight: 15 },
  dateText: { fontSize: 12 },
  currencyBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 7 },
  currencyText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  amount: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  cardFooter: { marginTop: 14, alignItems: 'flex-end' },
  categorizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Tavira.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  categorizeBtnText: { color: Tavira.navy, fontWeight: '700', fontSize: 13 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingHorizontal: 32 },
  emptyIconWrap: { width: 84, height: 84, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 19, fontWeight: '700' },
  emptySubtitle: { textAlign: 'center', lineHeight: 20, fontSize: 13 },
  summary: { borderRadius: 14, padding: 16, marginBottom: 20, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, fontWeight: '500' },
  summaryAmount: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  summaryDivider: { height: 1, borderRadius: 1 },
  summaryDate: { fontSize: 12 },
  sectionLabel: { fontWeight: '600', letterSpacing: 0.3, marginBottom: 10, marginTop: 4, fontSize: 13 },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 6 },
  chip: { borderRadius: 10 },
  hint: { fontStyle: 'italic', marginBottom: 8, fontSize: 13 },
  ruleDivider: { height: 1, borderRadius: 1, marginTop: 18, marginBottom: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  ruleLabelGroup: { flex: 1, gap: 3 },
  ruleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ruleLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
  ruleHint: { fontSize: 11, lineHeight: 15 },
});
