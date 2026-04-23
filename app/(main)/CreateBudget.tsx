import { Modal, ModalRef } from "@/components/Modal";
import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useCreateBudgetMutation } from "@/hooks/useBudgetQueries";
import { useCurrenciesQuery } from "@/hooks/useCurrencyQueries";
import { useBudgetUIStore } from "@/stores/budgetUIStore";
import { Budget } from "@/types/Types";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar, Button, HelperText, IconButton, List, MD2Colors, Text, TextInput } from "react-native-paper";

export default function CreateBudgetScreen() {
    const navigation = useNavigation();
    const createBudgetMutation = useCreateBudgetMutation();
    const { data: currencies = [] } = useCurrenciesQuery();
    const { setMainBudget } = useBudgetUIStore();
    const router = useRouter();
    const modalRef = useRef<ModalRef>(null);
    const { control, handleSubmit, watch, reset } = useForm<Budget>({
        defaultValues: {
            id: 0,
            name: "",
            users: null,
            currency: {
                code: "",
                name: "",
                symbol: ""
            },
            budgetCategories: [
                {
                    id: 0,
                    name: '',
                    budgetId: 0,
                    spendings: [
                        {
                            id: 0,
                            amount: undefined,
                            description: "ADD MONEY",
                            budgetCategoryId: 0,
                            budgetPeriodId: 0
                        }
                    ],
                },
            ],
        },
    });
    const selectedCurrency = watch("currency.code");

    async function onSubmit(data: Budget) {
        try {
            data.currency = currencies.find(c => c.code == data.currency.code)!;
            const budget = await createBudgetMutation.mutateAsync(data);
            await setMainBudget(budget.id);
            router.push("/(main)/(drawer)/(tabs)");
            reset();
        } catch {
            // snackbar shown via state
        }
    }

    useFocusEffect(
        useCallback(() => {
            reset();
            navigation.setOptions({
                header: () => (
                    <Appbar.Header>
                        {router.canGoBack() && (
                            <Appbar.BackAction onPress={() => router.back()} />
                        )}
                        <Text style={styles.headerTitle}>Create Budget</Text>
                        <Appbar.Action icon="check" onPress={handleSubmit(onSubmit)} />
                    </Appbar.Header>
                ),
            });
        }, [])
    );

    const { fields: categories, append: addCategory, remove } = useFieldArray({
        control,
        name: 'budgetCategories',
    });

    return (
        <ScreenContainer scrollable={false}>
            <OverlayLoader isVisible={createBudgetMutation.isPending} message='Creating budget...' />
            <Controller
                control={control}
                rules={{ required: "Budget name is required" }}
                name="name"
                render={({ field: { onChange, value }, fieldState }) => (
                    <>
                        <TextInput error={fieldState.error != null} value={value} onChangeText={onChange} style={styles.fullWidth} label="Budget name" />
                        <HelperText type="error" visible={!!fieldState.error}>
                            {fieldState.error?.message}
                        </HelperText>
                    </>
                )} />
            <Controller
                control={control}
                rules={{ required: "Budget Currency is required" }}
                name="currency.code"
                render={({ field: { onChange, value }, fieldState }) => (
                    <>
                        <TextInput
                            label="Currency"
                            editable={false}
                            value={value}
                            right={<TextInput.Icon icon="menu-down" onPress={() => modalRef.current?.open()} />}
                        />
                        <HelperText type="error" visible={!!fieldState.error}>
                            {fieldState.error?.message}
                        </HelperText>
                        <Modal ref={modalRef} title="Select Currency" loading={false} onSubmit={() => modalRef.current?.close()}>
                            <ScrollView style={styles.currencyScroll}>
                                {currencies.map(c => (
                                    <List.Item
                                        onPress={() => onChange(c.code)}
                                        key={c.id}
                                        title={c.code}
                                        description={c.name}
                                        right={props => value == c.code ? <List.Icon {...props} icon="check" /> : null}
                                    />
                                ))}
                            </ScrollView>
                        </Modal>
                    </>
                )} />
            <Text style={styles.categoriesLabel}>Categories:</Text>
            {categories.map((cat, index) => (
                <View key={index} style={styles.categoryRow}>
                    <Controller
                        control={control}
                        rules={{ required: "Category name is required" }}
                        name={`budgetCategories.${index}.name`}
                        render={({ field: { onChange, value }, fieldState }) => (
                            <View style={styles.nameField}>
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
                        name={`budgetCategories.${index}.spendings.0.amount`}
                        render={({ field: { onChange, value }, fieldState }) => (
                            <View style={styles.amountField}>
                                <TextInput error={fieldState.error != null} keyboardType='numeric' value={value ? value.toString() : ""} onChangeText={onChange} label={selectedCurrency} />
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </View>
                        )}
                    />
                    <IconButton icon="close" iconColor={MD2Colors.red800} onPress={() => remove(index)} />
                </View>
            ))}
            <Button onPress={() => addCategory({ id: 0, name: '', budgetId: 0, spendings: [{ amount: undefined!, id: 0, date: null, budgetCategoryId: 0, budgetPeriodId: 0, description: "ADD MONEY", bankTransaction: null, bankTransactionId: null }] })}>Add Category</Button>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerTitle: {
        flex: 1,
    },
    fullWidth: {
        marginBottom: 0,
        width: '100%',
    },
    currencyScroll: {
        maxHeight: 200,
    },
    categoriesLabel: {
        paddingBottom: 5,
    },
    categoryRow: {
        marginBottom: 10,
        flexDirection: 'row',
        gap: 10,
    },
    nameField: {
        width: '40%',
    },
    amountField: {
        width: '42%',
    },
});
