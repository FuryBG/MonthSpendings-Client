import { getNotCategorizedTransactions } from "@/app/services/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { BankTransaction } from "../types/Types";
import { useAuth } from "./AuthContext";


const BankTransactionsContext = createContext({
    transactions: [] as BankTransaction[],
    transactionsLoading: true as boolean,
    removeTransaction: (categorizedTransactionId: number) => { },
    reFetchTransactions: () => { },
});

export const useBankTransactions = () => useContext(BankTransactionsContext);

export function BankTransactionsProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [triggerReload, setTriggerReload] = useState<boolean>(false);
    const { user } = useAuth();
    const [transactionsLoading, setTransactionLoading] = useState<boolean>(true);
    const [selectedMainBudgetId, setSelectedMainBudget] = useState<number | null>(null);
    const [selectedBudgetCategoryId, setSelectedBudgetCategory] = useState<number | null>(null);

    // Initial fetch
    useEffect(() => {
        const init = async () => {
            if (user == null || user == undefined) {
                setTransactionLoading(false);
                return;
            }

            const data = await getNotCategorizedTransactions();
            setTransactions(data);
            setTransactionLoading(false);
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
        <BankTransactionsContext.Provider value={{ transactions, removeTransaction, transactionsLoading, reFetchTransactions }}>
            {children}
        </BankTransactionsContext.Provider>
    );
}