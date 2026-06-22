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
    isPro: boolean
    receivedBudgetInvites: BudgetInvite[]
    sentBudgetInvites: BudgetInvite[]
}

export interface UpdateUserActivityDto {
    timezone: string
}

export type Budget = {
    id: number
    name: string
    ownerId: number
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
    creditorName: string | null
    description: string | null
    determined: boolean
}

export type CategorizeBankTransactionDto = {
    id: number
    transactionId: string
    bankAccountId: number
    currency: string
    amount: number
    merchantCode: string | null
    creditorName: string | null
    description: string | null
    status: string
    bookingDate: string
    categorized: boolean
    categoryId: number
    createRule: boolean
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

export type BankAccountDto = {
    id: number
    iban: string
    currency: string
    holderName: string
}

export type BankConsentDto = {
    id: number
    sessionId: string
    bankName: string
    imageUrl: string
    validTo: string
    state: 'Initiated' | 'Connected' | 'Expired' | 'ConnectionFailed' | string
    bankAccounts: BankAccountDto[]
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
