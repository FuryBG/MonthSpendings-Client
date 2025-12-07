export type AppUser = {
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    notificationToken: string,
    googleId: string,
    googlePhotoAddress: string,
}

export type Budget = {
    id: number,
    name: string,
    budgetPeriods: BudgetPeriod[],
    budgetCategories: BudgetCategory[] | null,
    users: AppUser[] | null
}

export type BudgetPeriod = {
    id: number,
    budgetId: number,
    startDate: string,
    endDate: string | null
}

export type BudgetCategory = {
    id: number,
    budgetId: number,
    name: string,
    spendings: Spending[]
}

export type Spending = {
    id: number,
    amount: number,
    date: string | null,
    description: string,
    budgetCategoryId: number
    budgetPeriodId: number
}

export type BudgetInvite = {
    id: number,
    receiverEmail: string,
    budgetId: number,
    validTo: string | null,
    accepted: boolean | null
}