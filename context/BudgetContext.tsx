import { getBudgets } from "@/app/services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Budget, BudgetCategory, Spending } from "../types/Types";


const BudgetContext = createContext({
    budgets: [] as Budget[],
    loading: true as boolean,
    selectedMainBudgetId: null as number | null,
    selectedBudgetCategoryId: null as number | null,
    addBudget: (budget: Budget) => { },
    setMainBudget: (budgetId: number) => { },
    setSelectedBudgetCategory: (budgetCategoryId: number) => { },
    addSpending: (spending: Spending) => { },
    removeSpending: (removeSpendingId: number) => { },
    removeBudgetCategory: (removedBudgetCategoryId: number, budgetId: number) => { },
    addBudgetCategory: (addedBudgetCategory: BudgetCategory) => { },
    removeBudget: (deletedBudgetId: number) => { },
    reFetchBudgets: () => { },
});

export const useBudgets = () => useContext(BudgetContext);

export function BudgetProvider({ children }: { children: ReactNode }) {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [triggerReload, setTriggerReload] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedMainBudgetId, setSelectedMainBudget] = useState<number | null>(null);
    const [selectedBudgetCategoryId, setSelectedBudgetCategory] = useState<number | null>(null);

    // Initial fetch
    useEffect(() => {
        const init = async () => {
            const data = await getBudgets();
            setBudgets(data);
            let mainBudgetId = await loadMainBudgetId();
            let selectedBudget: Budget | undefined;

            if (mainBudgetId != null) {
                selectedBudget = data.find(b => b.id == mainBudgetId);
            }

            // set previously selected when start
            if (selectedBudget != undefined) {
                setMainBudget(selectedBudget.id);
                setLoading(false);
                return;
            }

            if (data.length > 0) {
                await setMainBudget(data[0].id);
            }

            setLoading(false);
        }

        init();
    }, [triggerReload]);


    async function loadMainBudgetId(): Promise<number | null> {
        const id = await AsyncStorage.getItem('mainBudgetId');
        return id != null ? Number(id) : null;
    }

    const addBudget = (budget: Budget) => {
        if (budgets.length == 0) {
            setSelectedMainBudget(budget.id);
        }

        setBudgets((prev) => [...prev, budget]);
    };

    const removeBudget = (deletedBudgetId: number) => {
        setBudgets((prev) => [...prev.filter(b => b.id != deletedBudgetId)]);

        if (budgets.length == 1) {
            setSelectedMainBudget(null);
        }

    };

    const setMainBudget = async (budgetId: number) => {
        const id = await AsyncStorage.setItem('mainBudgetId', budgetId.toString());
        setSelectedMainBudget(budgetId);
    };

    const addSpending = (newSpending: Spending) => {
        setBudgets(prev => prev.map(b => {
            if (b.id != selectedMainBudgetId) {
                return b;
            }

            return {
                ...b,
                budgetCategories: b!.budgetCategories!.map(bc => {
                    if (bc.id != selectedBudgetCategoryId) {
                        return bc;
                    }

                    return {
                        ...bc,
                        spendings: [...bc.spendings!, newSpending]
                    }
                })
            }
        }));
    };

    const removeSpending = (removedSpendingId: number) => {
        setBudgets(prev => prev.map(b => {
            if (b.id != selectedMainBudgetId) {
                return b;
            }

            return {
                ...b,
                budgetCategories: b.budgetCategories!.map(bc => {
                    if (bc.id != selectedBudgetCategoryId) {
                        return bc;
                    }

                    return {
                        ...bc,
                        spendings: bc.spendings!.filter(sp => sp.id != removedSpendingId)
                    }
                })
            }
        }));
    };

    const removeBudgetCategory = (removedBudgetCategoryId: number, budgetId: number) => {
        setBudgets(prev => prev.map(b => {
            if (b.id != budgetId) {
                return b;
            }


            return {
                ...b,
                budgetCategories: b.budgetCategories!.filter(bc => bc.id != removedBudgetCategoryId)
            }
        }));
    };

    const addBudgetCategory = (addedBudgetCategory: BudgetCategory) => {
        setBudgets(prev => prev.map(b => {
            if (b.id != addedBudgetCategory.budgetId) {
                return b;
            }

            return {
                ...b,
                budgetCategories: [...b.budgetCategories!, addedBudgetCategory]
            }
        }));
    };

    const reFetchBudgets = () => {
        setTriggerReload(prev => !prev);
    };

    return (
        <BudgetContext.Provider value={{ budgets, addBudget, reFetchBudgets, selectedMainBudgetId, setMainBudget, loading, setSelectedBudgetCategory, selectedBudgetCategoryId, addSpending, removeSpending, removeBudgetCategory, addBudgetCategory, removeBudget }}>
            {children}
        </BudgetContext.Provider>
    );
}
