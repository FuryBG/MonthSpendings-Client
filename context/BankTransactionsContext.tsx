import { getNotCategorizedTransactions } from "@/app/services/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { BankTransaction } from "../types/Types";
import { useAuth } from "./AuthContext";


const BankTransactionsContext = createContext({
    transactions: [] as BankTransaction[],
    loading: true as boolean,
    removeTransaction: (categorizedTransactionId: number) => { },
    reFetchTransactions: () => { },
});

export const useBankTransactions = () => useContext(BankTransactionsContext);

export function BankTransactionsProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [triggerReload, setTriggerReload] = useState<boolean>(false);
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedMainBudgetId, setSelectedMainBudget] = useState<number | null>(null);
    const [selectedBudgetCategoryId, setSelectedBudgetCategory] = useState<number | null>(null);

    // Initial fetch
    useEffect(() => {
        const init = async () => {
            if (user == null || user == undefined) {
                setLoading(false);
                return;
            }

            const data = await getNotCategorizedTransactions();
            setTransactions(data);
            setLoading(false);
        }

        init();

    }, [triggerReload, user]);


    const removeTransaction = (categorizedTransactionId: number) => {
        setTransactions((prev) => [...prev.filter(t => t.id != categorizedTransactionId)]);
    };

    const reFetchTransactions = () => {
        setTriggerReload(prev => !prev);
    };

    return (
        <BankTransactionsContext.Provider value={{ transactions, removeTransaction, loading, reFetchTransactions }}>
            {children}
        </BankTransactionsContext.Provider>
    );
}