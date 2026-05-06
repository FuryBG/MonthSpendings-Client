export type BudgetState = {
    budgets: Budget[],
    budgetLoading: 'loading' | 'ready' | 'failed',
    selectedMainBudgetId: number | null
}

export type AppUser = {
    id: number
    email: string
    firstName: string
    lastName: string
    notificationToken: string
    googleId: string
    googlePhotoAddress: string
    receivedBudgetInvites: BudgetInvite[]
    sentBudgetInvites: BudgetInvite[]
}

export type Budget = {
    id: number
    name: string
    currency: Currency
    budgetPeriods: BudgetPeriod[]
    budgetCategories: BudgetCategory[] | null
    users: AppUser[] | null
}

export type Currency = {
    id: number
    code: string
    name: string
    symbol: string
}

export type BudgetPeriod = {
    id: number
    budgetId: number
    startDate: string
    endDate: string | null
}

export type BudgetCategory = {
    id: number
    budgetId: number
    name: string
    spendings: Spending[]
    isDeleted: boolean
}

export type Spending = {
    id: number
    amount: number
    date: string | null
    description: string
    budgetCategoryId: number
    budgetPeriodId: number
    bankTransactionId: number | null
    bankTransaction: BankTransaction | null
    transactionDate: string | null
    createdByUserId: number
    createdByEmail: string | null
    createdByName: string | null
}

export type BankTransaction = {
    id: number
    transactionId: string
    bankAccountId: string
    currency: string
    amount: string
    bookingDate: string
}

export type CategorizeTransactionDto = {
    transactionId: number
    budgetId: string
    categoryId: string
    amount: string
    dateCreated: string
}

export type BudgetInvite = {
    id: number
    receiverEmail: string
    budgetId: number
    budgetName: string
    senderEmail: string
    senderName: string
    validTo: string | null
    accepted: boolean | null
}

export type BankOption = {
    name: string
    country: string
    logo: string
    bic: string
    maximumConsentValidity: number
}

export type SaltEdgeProvider = {
    code: string
    name: string
    countryCode: string
    logoUrl: string | null
    mode: string | null
    regulated: boolean
}

export type StartSaltEdgeConnectionResponse = {
    connectUrl: string
    localSessionId: string
}

export type SaltEdgeConnectionStatusResponse = {
    localSessionId: string
    state: 'Initiated' | 'Connected' | 'ConnectionFailed' | 'Removed' | string
    providerName: string
    errorMessage: string | null
}

export enum AppNotificationType {
    ReceivedInvite,
    InviteResponse,
    SpendingAdd,
    SpendingDelete
}

export type AppNotification = {
    type: AppNotificationType
}

// Savings
export type SavingsPot = {
    id: number
    name: string
    currency: Currency
    totalSaved: number
    createdByUserId: number
    createdAt: string
    users: AppUser[]
    recentContributions: SavingsContribution[]
}

export type SavingsContribution = {
    id: number
    savingsPotId: number
    amount: number
    date: string
    note: string | null
    addedByUserId: number
    addedByName: string | null
    addedByEmail: string | null
}

export type SavingsPotInvite = {
    id: number
    savingsPotId: number
    receiverEmail: string
    validTo: string | null
    accepted: boolean | null
}

export type SavingsHistoryDto = {
    runningTotal: number
    months: MonthlyContributionDto[]
}

export type MonthlyContributionDto = {
    year: number
    month: number
    total: number
    contributions: SavingsContribution[]
}

// Statistics
export type PeriodComparisonDto = {
    currentPeriod: PeriodSummaryDto
    previousPeriod: PeriodSummaryDto | null
    totalDelta: number
    totalDeltaPercent: number | null
}

export type PeriodSummaryDto = {
    periodId: number
    startDate: string
    endDate: string | null
    totalSpent: number
    categories: CategoryComparisonDto[]
}

export type CategoryComparisonDto = {
    categoryId: number
    categoryName: string
    amount: number
    isDeleted: boolean
}
