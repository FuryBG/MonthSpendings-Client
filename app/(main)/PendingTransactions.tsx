import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { Modal, ModalRef } from '@/components/Modal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Tavira } from '@/constants/theme';
import { PENDING_NOTIFICATION_TRANSACTIONS_KEY, useCategorizeNotificationTransactionMutation, useDeleteNotificationTransactionMutation, usePendingNotificationTransactionsQuery } from '@/hooks/useNotificationTransactionQueries';
import { queryClient } from '@/lib/queryClient';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { useTitleStore } from '@/stores/titleStore';
import { Budget, BudgetCategory, NotificationTransaction } from '@/types/Types';
import { useFocusEffect } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Button, Chip, Icon, Text, useTheme } from 'react-native-paper';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
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
        <Icon source="wallet-check-outline" size={36} color={isDark ? Tavira.teal : theme.colors.primary} />
      </View>
      <Text style={[s.emptyTitle, { color: theme.colors.onSurface }]}>All caught up</Text>
      <Text style={[s.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        No transactions waiting to be categorized.{'\n'}New wallet notifications will appear here automatically.
      </Text>
    </View>
  );
}

type CardProps = { item: NotificationTransaction; onCategorize: (t: NotificationTransaction) => void; swipeableRef: (r: Swipeable | null) => void; onDelete: (t: NotificationTransaction) => void };

function TransactionCard({ item, onCategorize, swipeableRef, onDelete }: CardProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const renderDeleteAction = () => (
    <TouchableOpacity
      style={[s.deleteAction, { backgroundColor: theme.colors.error }]}
      onPress={() => { onDelete(item); }}
    >
      <Icon source="trash-can-outline" size={22} color={theme.colors.onError} />
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderDeleteAction}>
    <View style={[s.card, {
      backgroundColor: isDark ? Tavira.glassBg : '#FFFFFF',
      borderColor: isDark ? Tavira.glassBorder : 'rgba(11,27,58,0.08)',
    }]}>
      <View style={s.cardRow}>
        <View style={[s.iconWrap, { backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant }]}>
          <Icon source="wallet-outline" size={20} color={isDark ? Tavira.teal : theme.colors.onSurfaceVariant} />
        </View>
        <View style={s.cardMeta}>
          <Text
            style={[s.merchantName, { color: isDark ? '#F2F4F8' : Tavira.navy }]}
            numberOfLines={1}
          >
            {item.merchantName}
          </Text>
          <Text style={[s.dateText, { color: theme.colors.onSurfaceVariant }]}>{formatDate(item.receivedAt)}</Text>
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
        <Text style={[s.amount, { color: Tavira.expense }]}>−{item.amount.toFixed(2)}</Text>
      </View>
      <View style={s.cardFooter}>
        <TouchableOpacity style={s.categorizeBtn} onPress={() => onCategorize(item)}>
          <Icon source="tag-outline" size={15} color={Tavira.navy} />
          <Text style={s.categorizeBtnText}>Categorize</Text>
        </TouchableOpacity>
      </View>
    </View>
    </Swipeable>
  );
}

type ModalBodyProps = {
  transaction: NotificationTransaction;
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

  return (
    <View>
      <View style={[s.summary, {
        backgroundColor: isDark ? 'rgba(255,107,107,0.08)' : 'rgba(255,107,107,0.06)',
        borderColor: isDark ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.15)',
        borderWidth: 1,
      }]}>
        <View style={s.summaryRow}>
          <Text style={[s.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Amount</Text>
          <Text style={[s.summaryAmount, { color: Tavira.expense }]}>
            −{transaction.amount.toFixed(2)} {transaction.currency}
          </Text>
        </View>
        <View style={[s.summaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.outlineVariant }]} />
        <View style={s.summaryRow}>
          <Text style={[s.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>Merchant</Text>
          <Text style={[s.summaryMerchant, { color: isDark ? '#F2F4F8' : Tavira.navy }]}>
            {transaction.merchantName}
          </Text>
        </View>
        <Text style={[s.summaryDate, { color: theme.colors.onSurfaceVariant }]}>
          {formatDate(transaction.receivedAt)}
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
            Save this choice for future transactions from {transaction.merchantName}
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
    </View>
  );
}

export default function PendingTransactions() {
  const { data: budgets = [] } = useBudgetsQuery();
  const { data: transactions = [], isLoading } = usePendingNotificationTransactionsQuery();
  const categorizeMutation = useCategorizeNotificationTransactionMutation();
  const deleteMutation = useDeleteNotificationTransactionMutation();
  const setTitle = useTitleStore((s) => s.setTitle);
  const modalRef = useRef<ModalRef>(null);
  const deleteSheetRef = useRef<BottomSheetRef>(null);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());
  const theme = useTheme();
  const isDark = theme.dark;

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedTransaction, setSelectedTransaction] = useState<NotificationTransaction | null>(null);
  const [createRule, setCreateRule] = useState<boolean>(false);
  const [confirmTransactionId, setConfirmTransactionId] = useState<number | null>(null);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);

  useFocusEffect(() => {
    setTitle('Transactions');
    queryClient.invalidateQueries({ queryKey: PENDING_NOTIFICATION_TRANSACTIONS_KEY });
  });

  function onCategorize(transaction: NotificationTransaction) {
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
        categoryId: selectedCategoryId,
        createRule,
      });
      setSelectedTransaction(null);
      modalRef.current?.close();
    } catch {
      // global MutationCache shows Snackbar
    }
  }

  function onDelete(transaction: NotificationTransaction) {
    swipeableRefs.current.get(transaction.id)?.close();
    setConfirmTransactionId(transaction.id);
    setDeleteSheetVisible(true);
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
            <TransactionCard
              item={item}
              onCategorize={onCategorize}
              swipeableRef={(r) => { swipeableRefs.current.set(item.id, r); }}
              onDelete={onDelete}
            />
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

      <BottomSheet
        ref={deleteSheetRef}
        visible={deleteSheetVisible}
        onClose={(onDone) => { setDeleteSheetVisible(false); setConfirmTransactionId(null); onDone?.(); }}
      >
        <View style={sheetStyles.sheetCenteredContent}>
          <View style={[sheetStyles.sheetConfirmIcon, { backgroundColor: theme.colors.errorContainer }]}>
            <Icon source="trash-can-outline" size={28} color={theme.colors.error} />
          </View>
          <Text style={[sheetStyles.sheetConfirmTitle, { color: theme.colors.onSurface }]}>Delete Transaction</Text>
          <Text style={[sheetStyles.sheetConfirmDesc, { color: theme.colors.onSurface }]}>This action cannot be undone.</Text>
        </View>
        <View style={sheetStyles.sheetActions}>
          <Button mode="text" onPress={() => deleteSheetRef.current?.close()}>Cancel</Button>
          <Button
            mode="contained"
            loading={deleteMutation.isPending}
            buttonColor={theme.colors.error}
            textColor={theme.colors.onError}
            contentStyle={sheetStyles.sheetConfirmContent}
            onPress={() => {
              if (confirmTransactionId != null) {
                deleteMutation.mutate(confirmTransactionId);
                deleteSheetRef.current?.close();
              }
            }}
          >
            Delete
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}

const s = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  deleteAction: { justifyContent: 'center', alignItems: 'center', width: 72, borderRadius: 18, marginLeft: 8 },
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
  merchantName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.1 },
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
  summaryMerchant: { fontSize: 13, fontWeight: '700' },
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
