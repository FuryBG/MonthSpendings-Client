import { Modal, ModalRef } from "@/components/Modal";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useBudgets } from "@/context/BudgetContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { BudgetCategory, BudgetInvite, Spending } from "@/types/Types";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { Button, HelperText, IconButton, List, MD2Colors, Portal, Snackbar, TextInput } from "react-native-paper";
import { createBudgetCategory, createInvite, deleteBudget, deleteBudgetCategory, finishBudget } from "../services/api";


export default function ManageBudgetScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const { user } = useAuth();
    const { reFetchBudgets, budgetState, removeBudgetCategory, addBudgetCategory, removeBudget } = useBudgets();
    const finishPeriodModalRef = useRef<ModalRef>(null);
    const deleteCategoryModalRef = useRef<ModalRef>(null);
    const createCategoryModalRef = useRef<ModalRef>(null);
    const deleteBudgetModalRef = useRef<ModalRef>(null);
    const createInviteModalRef = useRef<ModalRef>(null);
    const { setTitle } = useTitle();
    const params = useLocalSearchParams();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedBudgetCategoryId, setSelectedBudgetCategoryId] = useState<number>(0);
    const selectedMainBudget = budgetState.budgets.find(b => b.id == Number(params.budgetId));
    const selectedCategory = budgetState.budgets.filter(b => b.id == Number(params.budgetId)).flatMap(x => x.budgetCategories).find(c => c?.id == selectedBudgetCategoryId);

    const { control, handleSubmit, watch, reset } = useForm<BudgetCategory>({
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
            budgetId: budgetState.selectedMainBudgetId ?? 0,
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
        if (cancelled) {
            return;
        }

        try {
            setLoading(true);
            var budgetCategoryId = await deleteBudgetCategory(selectedBudgetCategoryId!);
            removeBudgetCategory(budgetCategoryId, selectedMainBudget!.id);
            setLoading(false);
            deleteCategoryModalRef.current?.close();
        }
        catch (e) {
            setErrorMessage("Deleting category was not successful.");
            setVisible(true);
            setLoading(false);
            console.log(e);
        }
    }

    async function onDeleteBudget(cancelled: boolean) {
        if (cancelled) {
            return;
        }

        try {
            setLoading(true);
            var budgetId = await deleteBudget(selectedMainBudget!.id);
            removeBudget(budgetId);
            setLoading(false);
            deleteBudgetModalRef.current?.close();
            router.push("/(main)/(tabs)");
        }
        catch (e) {
            setErrorMessage("Deleting budget was not successful.");
            setVisible(true);
            setLoading(false);
            console.log(e);
        }
    }

    async function onCreateCategory(budgetCategory: BudgetCategory) {
        try {
            setLoading(true);
            budgetCategory.budgetId = selectedMainBudget!.id;
            budgetCategory.spendings[0].budgetPeriodId = selectedMainBudget?.budgetPeriods[0].id ?? 0;
            const addedBudgetCategory = await createBudgetCategory(budgetCategory);
            addBudgetCategory(addedBudgetCategory);
            setLoading(false);
            createCategoryModalRef.current?.close();
            reset();
        }
        catch (e) {
            setErrorMessage("Creating category was not successful.");
            setVisible(true);
            setLoading(false);
            console.log(e);
        }
    }

    async function onCreateInvite(budgetInvite: BudgetInvite) {
        try {
            setLoading(true);
            await createInvite(budgetInvite);
            setLoading(false);
            createInviteModalRef.current?.close();
            reset();
        }
        catch (e) {
            setErrorMessage("Sending invite was not successful.");
            setVisible(true);
            setLoading(false);
            console.log(e);
        }
    }

    async function onFinishPeriod(cancelled: boolean) {
        if (cancelled || selectedMainBudget == undefined) {
            return;
        }

        selectedMainBudget!.budgetCategories!.forEach(category => {
            let spending: Spending = { id: 0, budgetPeriodId: 0, budgetCategoryId: category.id, date: new Date().toISOString(), amount: calculateRemaining(category.spendings), bankTransaction: null, bankTransactionId: null, description: "MOVED TO NEXT PERIOD" };
            category.spendings = [spending];
        });

        await finishBudget(selectedMainBudget);
        reFetchBudgets();
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
            <View style={{ display: "flex", flexDirection: "row", gap: "15", justifyContent: "space-between" }}>
                <Button onPress={onOpenFinishPeriodModal} style={{ marginBottom: 20 }} mode="contained">Finish</Button>
                <Button onPress={onOpenCreateInviteModal} style={{ marginBottom: 20 }} mode="contained">Invite</Button>
            </View>
            <List.Accordion style={{ marginBottom: 20 }} title="Categories" id="1">
                {selectedMainBudget != null && selectedMainBudget.budgetCategories?.map(bc =>
                    <List.Item left={props => <List.Icon {...props} icon="account-cash" />} right={props => <IconButton icon="close" iconColor={MD2Colors.red800} onPress={() => onOpenDeletecategoryModal(bc)} />} key={bc.id} title={bc.name} />
                )}
                <Button onPress={onOpenCreateCategoryModal} style={{ marginBottom: 20 }}>Add Category</Button>
            </List.Accordion>
            <Button style={{ marginBottom: 20 }} textColor="red" onPress={onOpenDeleteBudgetModal}>Delete Budget</Button>

            <Modal ref={finishPeriodModalRef} loading={loading} title={`Are you sure you wan't to finish ${selectedMainBudget?.name}? All remaining funds in categories will be transfered to the new period.`} onSubmit={(cancelled: boolean) => onFinishPeriod(cancelled)}>
            </Modal>
            <Modal ref={deleteCategoryModalRef} loading={loading} title={`Are you sure you wan't to delete ${selectedCategory?.name} category? All spendings history will be lost.`} onSubmit={(cancelled: boolean) => onDeleteCategory(cancelled)}>
            </Modal>
            <Modal ref={deleteBudgetModalRef} loading={loading} title={`Are you sure you wan't to delete ${selectedMainBudget?.name} budget? All spending categories and spendings history will be lost.`} onSubmit={(cancelled: boolean) => onDeleteBudget(cancelled)}>
            </Modal>
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