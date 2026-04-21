import { Modal, ModalRef } from "@/components/Modal";
import { ScreenContainer } from "@/components/ScreenContainer";
import {
    useAddBudgetCategoryMutation,
    useBudgetsQuery,
    useDeleteBudgetCategoryMutation,
    useDeleteBudgetMutation,
    useFinishBudgetMutation,
} from "@/hooks/useBudgetQueries";
import { useTitleStore } from "@/stores/titleStore";
import { BudgetCategory, BudgetInvite, Spending } from "@/types/Types";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, IconButton, List, MD2Colors, Portal, Snackbar, TextInput } from "react-native-paper";
import { createInvite } from "../services/api";

export default function ManageBudgetScreen() {
    const router = useRouter();
    const { data: budgets = [] } = useBudgetsQuery();
    const deleteBudgetCategoryMutation = useDeleteBudgetCategoryMutation();
    const addBudgetCategoryMutation = useAddBudgetCategoryMutation();
    const deleteBudgetMutation = useDeleteBudgetMutation();
    const finishBudgetMutation = useFinishBudgetMutation();
    const finishPeriodModalRef = useRef<ModalRef>(null);
    const deleteCategoryModalRef = useRef<ModalRef>(null);
    const createCategoryModalRef = useRef<ModalRef>(null);
    const deleteBudgetModalRef = useRef<ModalRef>(null);
    const createInviteModalRef = useRef<ModalRef>(null);
    const setTitle = useTitleStore((s) => s.setTitle);
    const params = useLocalSearchParams();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number>(0);
    const selectedMainBudget = budgets.find(b => b.id == Number(params.budgetId));
    const selectedCategory = budgets.filter(b => b.id == Number(params.budgetId)).flatMap(x => x.budgetCategories).find(c => c?.id == selectedBudgetCategoryId);

    const { control, handleSubmit, reset } = useForm<BudgetCategory>({
        defaultValues: {
            id: 0,
            budgetId: selectedMainBudget?.id,
            name: "",
            spendings: [
                {
                    id: 0,
                    amount: undefined,
                    description: "ADD MONEY",
                    budgetCategoryId: 0
                }
            ],
        }
    });

    const { control: inviteControl, handleSubmit: inviteHandleSubmit, reset: inviteReset } = useForm<BudgetInvite>({
        defaultValues: {
            id: 0,
            budgetId: selectedMainBudget?.id ?? 0,
            receiverEmail: ""
        }
    });

    function onOpenDeletecategoryModal(budgetCategory: BudgetCategory) {
        setSelectedBudgetCategoryId(budgetCategory.id);
        deleteCategoryModalRef.current?.open();
    }

    function onOpenCreateCategoryModal() {
        createCategoryModalRef.current?.open();
    }

    function onOpenDeleteBudgetModal() {
        deleteBudgetModalRef.current?.open();
    }

    function onOpenFinishPeriodModal() {
        finishPeriodModalRef.current?.open();
    }

    function onOpenCreateInviteModal() {
        createInviteModalRef.current?.open();
    }

    async function onDeleteCategory(cancelled: boolean) {
        if (cancelled) return;
        try {
            setLoading(true);
            await deleteBudgetCategoryMutation.mutateAsync(selectedBudgetCategoryId!);
            setLoading(false);
            deleteCategoryModalRef.current?.close();
        } catch {
            setErrorMessage("Deleting category was not successful.");
            setVisible(true);
            setLoading(false);
        }
    }

    async function onDeleteBudget(cancelled: boolean) {
        if (cancelled) return;
        try {
            setLoading(true);
            await deleteBudgetMutation.mutateAsync(selectedMainBudget!.id);
            setLoading(false);
            deleteBudgetModalRef.current?.close();
            router.push("/(main)/(drawer)/(tabs)");
        } catch {
            setErrorMessage("Deleting budget was not successful.");
            setVisible(true);
            setLoading(false);
        }
    }

    async function onCreateCategory(budgetCategory: BudgetCategory) {
        try {
            setLoading(true);
            budgetCategory.budgetId = selectedMainBudget!.id;
            budgetCategory.spendings[0].budgetPeriodId = selectedMainBudget?.budgetPeriods[0].id ?? 0;
            await addBudgetCategoryMutation.mutateAsync(budgetCategory);
            setLoading(false);
            createCategoryModalRef.current?.close();
            reset();
        } catch {
            setErrorMessage("Creating category was not successful.");
            setVisible(true);
            setLoading(false);
        }
    }

    async function onCreateInvite(budgetInvite: BudgetInvite) {
        try {
            setLoading(true);
            await createInvite(budgetInvite);
            setLoading(false);
            createInviteModalRef.current?.close();
            inviteReset();
        } catch {
            setErrorMessage("Sending invite was not successful.");
            setVisible(true);
            setLoading(false);
        }
    }

    async function onFinishPeriod(cancelled: boolean) {
        if (cancelled || selectedMainBudget == undefined) return;

        const budgetToFinish = {
            ...selectedMainBudget,
            budgetCategories: selectedMainBudget.budgetCategories!.map(category => ({
                ...category,
                spendings: [{
                    id: 0,
                    budgetPeriodId: 0,
                    budgetCategoryId: category.id,
                    date: new Date().toISOString(),
                    amount: calculateRemaining(category.spendings),
                    bankTransaction: null,
                    bankTransactionId: null,
                    description: "MOVED TO NEXT PERIOD"
                } as Spending],
            })),
        };

        await finishBudgetMutation.mutateAsync(budgetToFinish);
        finishPeriodModalRef.current?.close();
    }

    const calculateRemaining = (spendings: Spending[]) => {
        return spendings.reduce((sum, s) => {
            if (s.amount > 0) return sum + s.amount;
            return sum - Math.abs(s.amount);
        }, 0);
    };

    useFocusEffect(() => {
        setTitle(`Budget: ${selectedMainBudget?.name}`);
    });

    return (
        <ScreenContainer scrollable={true}>
            <View style={styles.topButtons}>
                <Button onPress={onOpenFinishPeriodModal} style={styles.topButton} mode="contained">Finish</Button>
                <Button onPress={onOpenCreateInviteModal} style={styles.topButton} mode="contained">Invite</Button>
            </View>
            <List.Accordion style={styles.accordion} title="Categories" id="1">
                {selectedMainBudget != null && selectedMainBudget.budgetCategories?.map(bc =>
                    <List.Item left={props => <List.Icon {...props} icon="account-cash" />} right={() => <IconButton icon="close" iconColor={MD2Colors.red800} onPress={() => onOpenDeletecategoryModal(bc)} />} key={bc.id} title={bc.name} />
                )}
                <Button onPress={onOpenCreateCategoryModal} style={styles.accordion}>Add Category</Button>
            </List.Accordion>
            <Button style={styles.accordion} textColor="red" onPress={onOpenDeleteBudgetModal}>Delete Budget</Button>

            <Modal ref={finishPeriodModalRef} loading={loading} title={`Are you sure you wan't to finish ${selectedMainBudget?.name}? All remaining funds in categories will be transfered to the new period.`} onSubmit={(cancelled: boolean) => onFinishPeriod(cancelled)} />
            <Modal ref={deleteCategoryModalRef} loading={loading} title={`Are you sure you wan't to delete ${selectedCategory?.name} category? All spendings history will be lost.`} onSubmit={(cancelled: boolean) => onDeleteCategory(cancelled)} />
            <Modal ref={deleteBudgetModalRef} loading={loading} title={`Are you sure you wan't to delete ${selectedMainBudget?.name} budget? All spending categories and spendings history will be lost.`} onSubmit={(cancelled: boolean) => onDeleteBudget(cancelled)} />
            <Modal ref={createCategoryModalRef} loading={loading} title={"Create Category"} onSubmit={(cancelled: boolean) => cancelled ? null : handleSubmit(onCreateCategory)()}>
                <Controller
                    control={control}
                    rules={{ required: "Category name is required" }}
                    name={`name`}
                    render={({ field: { onChange, value }, fieldState }) => (
                        <View>
                            <TextInput error={fieldState.error != null} value={value} onChangeText={onChange} label="Name" />
                            <HelperText type="error" visible={!!fieldState.error}>
                                {fieldState.error?.message}
                            </HelperText>
                        </View>
                    )}
                />
                <Controller
                    control={control}
                    rules={{ required: "Category amount is required" }}
                    name={`spendings.0.amount`}
                    render={({ field: { onChange, value }, fieldState }) => (
                        <View>
                            <TextInput error={fieldState.error != null} keyboardType='numeric' value={value ? value.toString() : ""} onChangeText={onChange} label="Money" />
                            <HelperText type="error" visible={!!fieldState.error}>
                                {fieldState.error?.message}
                            </HelperText>
                        </View>
                    )}
                />
            </Modal>
            <Modal ref={createInviteModalRef} loading={loading} title={"Invite"} onSubmit={(cancelled: boolean) => cancelled ? null : inviteHandleSubmit(onCreateInvite)()}>
                <Controller
                    control={inviteControl}
                    rules={{ required: "Email is required" }}
                    name={`receiverEmail`}
                    render={({ field: { onChange, value }, fieldState }) => (
                        <View>
                            <TextInput error={fieldState.error != null} value={value} onChangeText={onChange} label="Email" />
                            <HelperText type="error" visible={!!fieldState.error}>
                                {fieldState.error?.message}
                            </HelperText>
                        </View>
                    )}
                />
            </Modal>
            <Portal>
                <Snackbar
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    duration={5000}
                    action={{
                        label: 'OK',
                        onPress: () => setVisible(false),
                    }}>
                    {errorMessage}
                </Snackbar>
            </Portal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    topButtons: {
        flexDirection: 'row',
        gap: 15,
        justifyContent: 'space-between',
    },
    topButton: {
        marginBottom: 20,
    },
    accordion: {
        marginBottom: 20,
    },
});
