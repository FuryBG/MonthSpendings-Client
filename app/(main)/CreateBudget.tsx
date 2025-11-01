import { ModalRef } from "@/components/Modal";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTitle } from "@/context/NavBarTitleContext";
import { useFocusEffect } from "@react-navigation/native";
import { useRef } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";



type Budget = {
    id: number,
    name: string,
    monthlyBudget: MonthlyBudget
}

type MonthlyBudget = {
    id: number,
    startDate: string,
    endDate: string,
    budgetId: number,
    budgetCategories: BudgetCategory[]
}

type BudgetCategory = {
    id: number,
    name: string,
    monthlyBudgetId: number,
    spendings: Spending[]
}

type Spending = {
    id: number,
    date: string,
    amount: number,
    description: string,
    budgetCategoryId: number
}

export default function CreateBudgetScreen() {
    const { setTitle } = useTitle();
    const modalRef = useRef<ModalRef>(null);

    const { control, handleSubmit, watch, reset } = useForm<Budget>({
        defaultValues: {
            id: 0,
            name: '',
            monthlyBudget: {
                id: 0,
                startDate: '',
                endDate: '',
                budgetId: 0,
                budgetCategories: [
                    {
                        id: 0,
                        name: '',
                        monthlyBudgetId: 0,
                        spendings: [
                            {
                                amount: 0
                            }
                        ],
                    },
                ],
            },
        },
    });

        useFocusEffect(() => {
        setTitle("Create Budget");
        reset();
    });

    const { fields: categories, append: addCategory } = useFieldArray({
        control,
        name: 'monthlyBudget.budgetCategories',
    });

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScreenContainer>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                        <TextInput value={value} onChangeText={onChange} style={{ marginBottom: 20, width: "100%" }} label="Budget name" />)} />
                <Text style={{ paddingBottom: 5 }}>Categories:</Text>
                {categories.map((cat, index) => (
                    <View key={cat.id} style={{ marginBottom: 10, display: "flex", flexDirection: "row", gap: 10 }}>
                        <Controller
                            control={control}
                            name={`monthlyBudget.budgetCategories.${index}.name`}
                            render={({ field: { onChange, value } }) => (
                                <TextInput style={{ width: "50%" }} value={value} onChangeText={onChange} label="Category name" />
                            )}
                        />
                        <Controller
                            control={control}
                            name={`monthlyBudget.budgetCategories.${index}.spendings.0.amount`}
                            render={({ field: { onChange, value } }) => (
                                <TextInput keyboardType='numeric' style={{ width: "46%" }} value={value.toString()} onChangeText={onChange} label="Category money" />
                            )}
                        />
                    </View>
                ))}
                <Button onPress={() => addCategory({ id: Date.now(), name: '', monthlyBudgetId: 0, spendings: [{ amount: 0, id: 0, budgetCategoryId: 0, date: "", description: "" }] })}>Add Category</Button>
            </ScreenContainer>
        </SafeAreaView>

    );
}