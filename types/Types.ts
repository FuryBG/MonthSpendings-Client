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
    syncWalletTransactions: boolean
    subscription: {
        productId: string
        store: string
        expiresAt: string
        updatedAt: string
    } | null
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
    notificationTransactionId: number | null
    notificationTransaction: NotificationTransaction | null
    createdByUserId: number
    createdByEmail: string | null
    createdByName: string | null
}

export type NotificationTransaction = {
    id: number
    amount: number
    currency: string
    merchantName: string
    receivedAt: string
    categorized: boolean
}

export type CreateNotificationTransactionDto = {
    merchantName: string
    amount: number
    currency: string
    rawTitle?: string
    rawBody?: string
}

export type CategorizeNotificationTransactionDto = {
    id: number
    categoryId: number
    createRule: boolean
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
