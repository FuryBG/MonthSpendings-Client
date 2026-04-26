import { Modal, ModalRef } from '@/components/Modal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useCategorizeTransactionMutation, usePendingTransactionsQuery } from '@/hooks/useBankTransactionQueries';
import { useBudgetsQuery } from '@/hooks/useBudgetQueries';
import { useTitleStore } from '@/stores/titleStore';
import { BankTransaction, Budget, BudgetCategory } from '@/types/Types';
import { useFocusEffect } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Icon, Surface, Text, useTheme } from 'react-native-paper';

const COLOR_EXPENSE = '#F87171';

function formatDate(iso: string): string {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} · ${time}`;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
    const theme = useTheme();
    return (
        <View style={s.emptyContainer}>
            <Surface style={[s.emptyIconWrap, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                <Icon source="bank-check-outline" size={38} color={theme.colors.onSurfaceVariant} />
            </Surface>
            <Text variant="titleMedium" style={[s.emptyTitle, { color: theme.colors.onSurface }]}>
                All caught up
            </Text>
            <Text variant="bodySmall" style={[s.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                No transactions waiting to be categorized.{'\n'}New bank imports will appear here automatically.
            </Text>
        </View>
    );
}

// ─── Transaction Card ─────────────────────────────────────────────────────────

type CardProps = { item: BankTransaction; onCategorize: (t: BankTransaction) => void };

function TransactionCard({ item, onCategorize }: CardProps) {
    const theme = useTheme();
    return (
        <Card mode="elevated" elevation={1} style={s.card}>
            <Card.Content style={s.cardContent}>
                <View style={s.cardRow}>
                    <Surface style={[s.iconWrap, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                        <Icon source="bank-outline" size={22} color={theme.colors.onSurfaceVariant} />
                    </Surface>

                    <View style={s.cardMeta}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {formatDate(item.bookingDate)}
                        </Text>
                        <View style={[s.currencyBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {item.currency}
                            </Text>
                        </View>
                    </View>

                    <Text style={s.amount}>−{item.amount}</Text>
                </View>

                <View style={s.cardFooter}>
                    <Button
                        mode="contained-tonal"
                        compact
                        icon="tag-outline"
                        onPress={() => onCategorize(item)}
                        style={s.categorizeBtn}
                        labelStyle={s.categorizeBtnLabel}
                    >
                        Categorize
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );
}

// ─── Modal body ───────────────────────────────────────────────────────────────

type ModalBodyProps = {
    transaction: BankTransaction;
    budgets: Budget[];
    selectedBudget: Budget | null;
    selectedCategoryId: number;
    onSelectBudget: (b: Budget) => void;
    onSelectCategory: (c: BudgetCategory) => void;
};

function CategorizeBody({ transaction, budgets, selectedBudget, selectedCategoryId, onSelectBudget, onSelectCategory }: ModalBodyProps) {
    const theme = useTheme();
    return (
        <View>
            {/* Transaction summary */}
            <Surface style={[s.summary, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                <View style={s.summaryRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Amount</Text>
                    <Text style={[s.summaryAmount, { color: COLOR_EXPENSE }]}>
                        −{transaction.amount} {transaction.currency}
                    </Text>
                </View>
                <View style={[s.summaryDivider, { backgroundColor: theme.colors.outlineVariant }]} />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(transaction.bookingDate)}
                </Text>
            </Surface>

            {/* Budget chips */}
            <Text variant="labelLarge" style={[s.sectionLabel, { color: theme.colors.onSurface }]}>
                Budget
            </Text>
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

            {/* Category chips */}
            <Text variant="labelLarge" style={[s.sectionLabel, { color: theme.colors.onSurface }]}>
                Category
            </Text>
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
                <Text variant="bodySmall" style={[s.hint, { color: theme.colors.onSurfaceVariant }]}>
                    Select a budget first
                </Text>
            )}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PendingTransactions() {
    const { data: budgets = [] } = useBudgetsQuery();
    const { data: transactions = [], isLoading } = usePendingTransactionsQuery();
    const categorizeMutation = useCategorizeTransactionMutation();
    const setTitle = useTitleStore((s) => s.setTitle);
    const modalRef = useRef<ModalRef>(null);
    const theme = useTheme();

    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
    const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);

    useFocusEffect(() => { setTitle('Transactions'); });

    function onCategorize(transaction: BankTransaction) {
        setSelectedTransaction(transaction);
        setSelectedBudget(null);
        setSelectedCategoryId(0);
        modalRef.current?.open();
    }

    async function onSave() {
        try {
            await categorizeMutation.mutateAsync({
                amount: -Number(selectedTransaction!.amount),
                date: selectedTransaction!.bookingDate,
                bankTransactionId: selectedTransaction!.id,
                budgetCategoryId: selectedCategoryId,
                budgetPeriodId: selectedBudget!.budgetPeriods[0].id,
                id: 0,
                description: `FROM TRANSACTION WITH ID: ${selectedTransaction!.id}`,
                bankTransaction: null,
            });
            setSelectedTransaction(null);
            modalRef.current?.close();
        } catch {
            // global MutationCache shows Snackbar
        }
    }

    if (isLoading) {
        return (
            <ScreenContainer scrollable={false}>
                <View style={s.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <>
            <ScreenContainer scrollable={false}>
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => `${item.id}`}
                    contentContainerStyle={[s.list, transactions.length === 0 && s.listEmpty]}
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
                    windowSize={5}
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
                        onSelectBudget={setSelectedBudget}
                        onSelectCategory={(c) => setSelectedCategoryId(c.id)}
                    />
                )}
            </Modal>
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
        paddingBottom: 32,
    },
    listEmpty: {
        flex: 1,
    },
    separator: {
        height: 10,
    },

    // Card
    card: {
        borderRadius: 16,
    },
    cardContent: {
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardMeta: {
        flex: 1,
        gap: 5,
    },
    currencyBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    amount: {
        fontSize: 22,
        fontWeight: '800',
        color: COLOR_EXPENSE,
        letterSpacing: -0.5,
    },
    cardFooter: {
        marginTop: 14,
        alignItems: 'flex-end',
    },
    categorizeBtn: {
        borderRadius: 10,
    },
    categorizeBtnLabel: {
        fontSize: 13,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 32,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    emptyTitle: {
        fontWeight: '700',
    },
    emptySubtitle: {
        textAlign: 'center',
        lineHeight: 20,
    },

    // Modal body
    summary: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        gap: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryAmount: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    summaryDivider: {
        height: 1,
        borderRadius: 1,
    },
    sectionLabel: {
        fontWeight: '600',
        letterSpacing: 0.3,
        marginBottom: 10,
        marginTop: 4,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 6,
    },
    chip: {
        borderRadius: 10,
    },
    hint: {
        fontStyle: 'italic',
        marginBottom: 8,
    },
});
