import { Modal, ModalRef } from "@/components/Modal";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useBankTransactions } from "@/context/BankTransactionsContext";
import { useBudgets } from "@/context/BudgetContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { BankTransaction, Budget, BudgetCategory, Spending } from "@/types/Types";
import { Label } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FlatList, View } from "react-native";
import { Button, Card, MD2Colors, Portal, Snackbar, Text } from "react-native-paper";
import { createSpending } from "../services/api";


export default function PendingTransactions() {
    const navigation = useNavigation();
    const router = useRouter();
    const { budgetState, addSpending } = useBudgets();
    const { setTitle } = useTitle();
    const [value, setValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);
    const { transactions, removeTransaction } = useBankTransactions();
    const modalRef = useRef<ModalRef>(null);
    const { control, handleSubmit, watch, reset } = useForm<Spending>({});

    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
    const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);

    async function onSelectTransaction(selectedTransaction: BankTransaction) {
        console.log(selectedTransaction.amount);

        setSelectedTransaction(selectedTransaction);
    }

    async function onSelectedBudget(selectedBudget: Budget) {
        setSelectedBudget(selectedBudget);
    }

    async function onSelectBudget(budget: Budget) {
        setSelectedBudget(budget);
    }

    async function onSelectBudgetCategory(category: BudgetCategory) {
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
        setLoading(true);
        try {
            let spending: Spending = await createSpending({
                amount: -Number(selectedTransaction!.amount),
                date: selectedTransaction!.bookingDate,
                bankTransactionId: selectedTransaction!.id,
                budgetCategoryId: selectedCategoryId,
                budgetPeriodId: selectedBudget!.budgetPeriods[0].id,
                id: 0,
                description: `FROM TRANSACTION WITH ID: ${selectedTransaction!.id}`,
                bankTransaction: null

            });

            addSpending(spending, selectedCategoryId);
            removeTransaction(selectedTransaction!.id);
            setSelectedTransaction(null);
            modalRef.current?.close();
        }
        catch (e) {
            setErrorVisible(true);
        }

        setLoading(false);
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
                    <Card mode="contained" style={{ margin: 10, padding: 5 }} onPress={() => onSelectTransaction(item)}>
                        <Card.Content style={{}}>
                            <View>
                                <View style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', paddingRight: 5 }}>Amount:</Text>
                                    <Text>{item.amount}</Text>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', paddingRight: 5 }}>Currency:</Text>
                                    <Text>{item.currency}</Text>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', paddingRight: 5 }}>Date:</Text>
                                    <Text>{new Date(item.bookingDate).toLocaleString(undefined, { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</Text>
                                </View>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 25 }}>
                                <Button mode="contained" onPress={() => onAdd(item)}>Add</Button>
                                <Button style={{ backgroundColor: MD2Colors.red500 }} mode="contained">Remove</Button>
                            </View>
                        </Card.Content>
                    </Card>
                )}
            />

            <Modal ref={modalRef} loading={loading} title={"Categorize Transaction"} onSubmit={((cancelled: boolean) => cancelled ? null : onSave())}>
                {selectedTransaction &&
                    <>
                        <View style={{ paddingBottom: 20, display: 'flex', gap: 10 }}>
                            <View>
                                <Label style={{ textAlign: "left", fontWeight: 'bold' }}>Amount:</Label>
                                <Label style={{ textAlign: "left" }}>{` ${selectedTransaction?.amount}`}</Label>
                            </View>
                            <View>
                                <Label style={{ textAlign: "left", fontWeight: 'bold' }}>Currency:</Label>
                                <Label style={{ textAlign: "left" }}>{` ${selectedTransaction?.currency}`}</Label>
                            </View>
                            <View>
                                <Label style={{ textAlign: "left", fontWeight: 'bold' }}>Date: </Label>
                                <Label style={{ textAlign: "left" }}>{`${new Date(selectedTransaction?.bookingDate).toLocaleDateString()}`}</Label>
                            </View>
                        </View>
                        <Label style={{ textAlign: "left" }}>Select Budget:</Label>
                        <View style={{ display: 'flex', gap: 10, flexDirection: 'row', paddingTop: 10, paddingBottom: 10 }}>
                            {budgetState.budgets.map(b =>
                                <Button key={b.id} mode={b.name == selectedBudget?.name ? "contained" : "outlined"} onPress={() => onSelectBudget(b)}>
                                    {b.name}
                                </Button>

                            )}
                        </View>

                        <Label style={{ textAlign: "left" }}>Select Category:</Label>
                        <View style={{ display: 'flex', gap: 10, flexDirection: 'row', paddingTop: 10, paddingBottom: 10 }}>
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
        </ScreenContainer >

    );
}