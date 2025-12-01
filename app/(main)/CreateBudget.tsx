import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useBudgets } from "@/context/BudgetContext";
import { Budget } from "@/types/Types";
import { DrawerActions } from "@react-navigation/native";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { View } from "react-native";
import { Appbar, Button, HelperText, IconButton, MD2Colors, Portal, Snackbar, Text, TextInput } from "react-native-paper";
import { createBudget } from "../services/api";


export default function CreateBudgetScreen() {
    const navigation = useNavigation();
    const { addBudget } = useBudgets();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, watch, reset } = useForm<Budget>({
        defaultValues: {
            id: 0,
            name: "",
            users: null,
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

    async function onSubmit(data: Budget) {
        try {
            setLoading(true);
            var budget = await createBudget(data);
            addBudget(budget);
            setLoading(false);
            router.push("/(main)/(tabs)");
            reset();
            requestAnimationFrame(() => {
                navigation.dispatch(DrawerActions.closeDrawer());
            });
        }
        catch (e) {
            setVisible(true);
            setLoading(false);
        }

    }

    useFocusEffect(
        useCallback(() => {
            reset();
            navigation.setOptions({
                header: () => (
                    <Appbar.Header>
                        {router.canGoBack() && (
                            <Appbar.BackAction onPress={() => {
                                router.back();
                            }} />
                        )}
                        <Appbar.Content title={"Create Budget"} />
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

        <ScreenContainer scrollable={true}>
            <OverlayLoader isVisible={loading} message='Creating budget...'></OverlayLoader>
            <Controller
                control={control}
                rules={{ required: "Budget name is required" }}
                name="name"
                render={({ field: { onChange, value }, fieldState }) => (
                    <>
                        <TextInput error={fieldState.error != null} value={value} onChangeText={onChange} style={{ marginBottom: 0, width: "100%" }} label="Budget name" />
                        <HelperText type="error" visible={!!fieldState.error}>
                            {fieldState.error?.message}
                        </HelperText>
                    </>
                )} />
            <Text style={{ paddingBottom: 5 }}>Categories:</Text>
            {categories.map((cat, index) => (
                <View key={index} style={{ marginBottom: 10, display: "flex", flexDirection: "row", gap: 10 }}>
                    <Controller
                        control={control}
                        rules={{ required: "Category name is required" }}
                        name={`budgetCategories.${index}.name`}
                        render={({ field: { onChange, value }, fieldState }) => (
                            <View style={{ width: "40%" }}>
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
                            <View style={{ width: "42%" }}>
                                <TextInput error={fieldState.error != null} keyboardType='numeric' value={value ? value.toString() : ""} onChangeText={onChange} label="Money" />
                                <HelperText type="error" visible={!!fieldState.error}>
                                    {fieldState.error?.message}
                                </HelperText>
                            </View>
                        )}
                    />

                    <IconButton icon="close" iconColor={MD2Colors.red800} onPress={() => remove(index)} />

                </View>
            ))}
            <Button onPress={() => addCategory({ id: 0, name: '', budgetId: 0, spendings: [{ amount: undefined!, id: 0, date: null, budgetCategoryId: 0, budgetPeriodId: 0, description: "ADD MONEY" }] })}>Add Category</Button>
            <Portal>
                <Snackbar
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    duration={5000}
                    action={{
                        label: 'OK',
                        onPress: () => setVisible(false),
                    }}>
                    Create Budget failed.
                </Snackbar>
            </Portal>
        </ScreenContainer>

    );
}