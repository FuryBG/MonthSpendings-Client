import { Modal, ModalRef } from "@/components/Modal";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useCategorizeTransactionMutation, usePendingTransactionsQuery } from "@/hooks/useBankTransactionQueries";
import { useBudgetsQuery } from "@/hooks/useBudgetQueries";
import { useTitleStore } from "@/stores/titleStore";
import { BankTransaction, Budget, BudgetCategory } from "@/types/Types";
import { Label } from "@react-navigation/elements";
import { useFocusEffect } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, MD2Colors, Portal, Snackbar, Text } from "react-native-paper";

export default function PendingTransactions() {
    const { data: budgets = [] } = useBudgetsQuery();
    const { data: transactions = [] } = usePendingTransactionsQuery();
    const categorizeMutation = useCategorizeTransactionMutation();
    const setTitle = useTitleStore((s) => s.setTitle);
    const [errorVisible, setErrorVisible] = useState(false);
    const modalRef = useRef<ModalRef>(null);

    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
    const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);

    function onSelectBudget(budget: Budget) {
        setSelectedBudget(budget);
    }

    function onSelectBudgetCategory(category: BudgetCategory) {
        setSelectedCategoryId(category.id);
    }

    useFocusEffect(() => {
        setTitle("Transactions");
    });

    function onAdd(transaction: BankTransaction) {
        setSelectedTransaction(transaction);
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
                bankTransaction: null
            });
            setSelectedTransaction(null);
            modalRef.current?.close();
        } catch {
            setErrorVisible(true);
        }
    }

    return (
        <ScreenContainer scrollable={false}>
            <FlatList
                data={transactions}
                keyExtractor={(item) => `${item.id}`}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                renderItem={({ item }) => (
                    <Card mode="contained" style={styles.transactionCard}>
                        <Card.Content>
                            <View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Amount:</Text>
                                    <Text>{item.amount}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Currency:</Text>
                                    <Text>{item.currency}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Date:</Text>
                                    <Text>{new Date(item.bookingDate).toLocaleString(undefined, { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</Text>
                                </View>
                            </View>
                            <View style={styles.buttonRow}>
                                <Button mode="contained" onPress={() => onAdd(item)}>Add</Button>
                                <Button style={styles.removeButton} mode="contained">Remove</Button>
                            </View>
                        </Card.Content>
                    </Card>
                )}
            />

            <Modal ref={modalRef} loading={categorizeMutation.isPending} title={"Categorize Transaction"} onSubmit={((cancelled: boolean) => cancelled ? null : onSave())}>
                {selectedTransaction &&
                    <>
                        <View style={styles.detailContainer}>
                            <View>
                                <Label style={styles.detailLabel}>Amount:</Label>
                                <Label style={styles.detailValue}>{` ${selectedTransaction?.amount}`}</Label>
                            </View>
                            <View>
                                <Label style={styles.detailLabel}>Currency:</Label>
                                <Label style={styles.detailValue}>{` ${selectedTransaction?.currency}`}</Label>
                            </View>
                            <View>
                                <Label style={styles.detailLabel}>Date: </Label>
                                <Label style={styles.detailValue}>{`${new Date(selectedTransaction?.bookingDate).toLocaleDateString()}`}</Label>
                            </View>
                        </View>
                        <Label style={styles.detailValue}>Select Budget:</Label>
                        <View style={styles.selectionRow}>
                            {budgets.map(b =>
                                <Button key={b.id} mode={b.name == selectedBudget?.name ? "contained" : "outlined"} onPress={() => onSelectBudget(b)}>
                                    {b.name}
                                </Button>
                            )}
                        </View>

                        <Label style={styles.detailValue}>Select Category:</Label>
                        <View style={styles.selectionRow}>
                            {selectedBudget?.budgetCategories?.map(c =>
                                <Button key={c.id} mode={c.id == selectedCategoryId ? "contained" : "outlined"} onPress={() => onSelectBudgetCategory(c)}>
                                    {c.name}
                                </Button>
                            )}
                        </View>
                    </>
                }
            </Modal>
            <Portal>
                <Snackbar
                    visible={errorVisible}
                    onDismiss={() => setErrorVisible(false)}
                    duration={5000}
                    action={{
                        label: 'OK',
                        onPress: () => setErrorVisible(false),
                    }}>
                    Operation failed.
                </Snackbar>
            </Portal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    transactionCard: {
        margin: 10,
        padding: 5,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontWeight: 'bold',
        paddingRight: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        paddingTop: 25,
    },
    removeButton: {
        backgroundColor: MD2Colors.red500,
    },
    detailContainer: {
        paddingBottom: 20,
        gap: 10,
    },
    detailLabel: {
        textAlign: 'left',
        fontWeight: 'bold',
    },
    detailValue: {
        textAlign: 'left',
    },
    selectionRow: {
        gap: 10,
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
    },
});
