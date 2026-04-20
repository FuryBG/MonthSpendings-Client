import { getBudgets } from "@/app/services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Budget, BudgetCategory, BudgetState, Spending } from "../types/Types";
import { useAuth } from "./AuthContext";


const BudgetContext = createContext({
    budgetState: {} as BudgetState,
    addBudget: (budget: Budget) => { },
    setMainBudget: (budgetId: number) => { },
    addSpending: (spending: Spending, selectedBudgetCategoryId: number) => { },
    removeSpending: (removeSpendingId: number, selectedBudgetCategoryId: number) => { },
    removeBudgetCategory: (removedBudgetCategoryId: number, budgetId: number) => { },
    addBudgetCategory: (addedBudgetCategory: BudgetCategory) => { },
    removeBudget: (deletedBudgetId: number) => { },
    reFetchBudgets: () => { },
});

export const useBudgets = () => useContext(BudgetContext);

export function BudgetProvider({ children }: { children: ReactNode }) {
    const [budgetState, setBudgetState] = useState<BudgetState>({ budgets: [], budgetLoading: 'loading', selectedMainBudgetId: null });
    const [triggerReload, setTriggerReload] = useState<boolean>(false);
    const { user, userLoading } = useAuth();

    // Initial fetch
    useEffect(() => {
        const init = async () => {
            if (!user) {
                return;
            }
            const data = await getBudgets();
            try {
                let mainBudgetId = await loadMainBudgetId();
                let selectedBudget: Budget | undefined;

                if (mainBudgetId != null) {
                    selectedBudget = data.find(b => b.id == mainBudgetId);
                }

                // set previously selected when start
                if (selectedBudget != undefined) {
                    setMainBudget(selectedBudget.id);
                }

                if (data.length > 0 && selectedBudget == undefined) {
                    await setMainBudget(data[0].id);
                }
                setBudgetState(prev => ({ ...prev, budgets: data, budgetLoading: 'ready' }));
            }
            catch (e) {

            }
        }
        init();
    }, [triggerReload, user]);


    async function loadMainBudgetId(): Promise<number | null> {
        const id = await AsyncStorage.getItem('mainBudgetId');
        return id != null ? Number(id) : null;
    }

    const addBudget = (budget: Budget) => {
        if (budgetState.budgets.length == 0) {
            setBudgetState((prev) => ({ ...prev, selectedMainBudgetId: budget.id }));
        }

        setBudgetState((prev) => ({ ...prev, budgets: [...prev.budgets, budget] }));
    };

    const removeBudget = (deletedBudgetId: number) => {
        setBudgetState((prev) => ({ ...prev, budgets: prev.budgets.filter(b => b.id != deletedBudgetId) }));

        if (budgetState.budgets.length == 1) {
            setBudgetState((prev) => ({ ...prev, selectedMainBudgetId: null }));
        }
    };

    const setMainBudget = (budgetId: number) => {
        const id = AsyncStorage.setItem('mainBudgetId', budgetId.toString());
        setBudgetState(prev => ({ ...prev, selectedMainBudgetId: budgetId }))
    };

    const addSpending = (newSpending: Spending, selectedBudgetCategoryId: number) => {
        setBudgetState(prev => ({
            ...prev, budgets: prev.budgets.map(b => {
                if (b.id != budgetState.selectedMainBudgetId) {
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
            })
        }))
        // setBudgets(prev => prev.map(b => {
        //     if (b.id != selectedMainBudgetId) {
        //         return b;
        //     }

        //     return {
        //         ...b,
        //         budgetCategories: b!.budgetCategories!.map(bc => {
        //             if (bc.id != selectedBudgetCategoryId) {
        //                 return bc;
        //             }

        //             return {
        //                 ...bc,
        //                 spendings: [...bc.spendings!, newSpending]
        //             }
        //         })s
        //     }
        // }));
    };

    const removeSpending = (removedSpendingId: number, selectedBudgetCategoryId: number) => {
        setBudgetState(prev => ({
            ...prev, budgets: prev.budgets.map(b => {
                if (b.id != budgetState.selectedMainBudgetId) {
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
            })
        }))
        // setBudgets(prev => prev.map(b => {
        //     if (b.id != selectedMainBudgetId) {
        //         return b;
        //     }

        //     return {
        //         ...b,
        //         budgetCategories: b.budgetCategories!.map(bc => {
        //             if (bc.id != selectedBudgetCategoryId) {
        //                 return bc;
        //             }

        //             return {
        //                 ...bc,
        //                 spendings: bc.spendings!.filter(sp => sp.id != removedSpendingId)
        //             }
        //         })
        //     }
        // }));
    };

    const removeBudgetCategory = (removedBudgetCategoryId: number, budgetId: number) => {
        setBudgetState(prev => ({
            ...prev, budgets: prev.budgets.map(b => {
                if (b.id != budgetId) {
                    return b;
                }


                return {
                    ...b,
                    budgetCategories: b.budgetCategories!.filter(bc => bc.id != removedBudgetCategoryId)
                }
            })
        }))
        // setBudgets(prev => prev.map(b => {
        //     if (b.id != budgetId) {
        //         return b;
        //     }


        //     return {
        //         ...b,
        //         budgetCategories: b.budgetCategories!.filter(bc => bc.id != removedBudgetCategoryId)
        //     }
        // }));
    };

    const addBudgetCategory = (addedBudgetCategory: BudgetCategory) => {
        setBudgetState(prev => ({
            ...prev, budgets: prev.budgets.map(b => {
                if (b.id != addedBudgetCategory.budgetId) {
                    return b;
                }

                return {
                    ...b,
                    budgetCategories: [...b.budgetCategories!, addedBudgetCategory]
                }
            })
        }))
        // setBudgets(prev => prev.map(b => {
        //     if (b.id != addedBudgetCategory.budgetId) {
        //         return b;
        //     }

        //     return {
        //         ...b,
        //         budgetCategories: [...b.budgetCategories!, addedBudgetCategory]
        //     }
        // }));
    };

    const reFetchBudgets = () => {
        setTriggerReload(prev => !prev);
    };

    return (
        <BudgetContext.Provider value={{ budgetState, addBudget, reFetchBudgets, setMainBudget, addSpending, removeSpending, removeBudgetCategory, addBudgetCategory, removeBudget }}>
            {children}
        </BudgetContext.Provider>
    );
}
