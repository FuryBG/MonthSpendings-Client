# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Start Expo development server
npm run android     # Build and run on Android
npm run ios         # Build and run on iOS
npm run web         # Run web version
npm run lint        # Run ESLint (expo lint)
```

There are no tests configured in this project.

## Architecture

**MonthSpendings** is a React Native (Expo) mobile app for personal budget tracking with bank integration. Built with TypeScript, Expo Router, and React Native Paper.

### Navigation (Expo Router file-based)

```
app/
├── (auth)/Login.tsx          — Google OAuth login screen
└── (main)/                   — Protected; redirects to Login if unauthenticated
    ├── _layout.tsx           — Drawer navigation + budget selector header
    ├── (tabs)/index.tsx      — Home dashboard (categories + spending)
    ├── CreateBudget.tsx
    ├── ManageBudget.tsx
    ├── PendingTransactions.tsx — Uncategorized bank transactions
    ├── ConnectBank.tsx
    ├── Invites.tsx
    └── spending-group/SpendingDetails.tsx
```

### State Management (React Context API)

All global state lives in `context/`. No Redux/Zustand.

| Context | Purpose |
|---------|---------|
| `AuthContext` | JWT token (SecureStore), user profile, sign in/out |
| `BudgetContext` | Budgets, categories, spending CRUD; selected budget persisted in AsyncStorage |
| `BankTransactionsContext` | Uncategorized bank transactions pending user action |
| `NotificationContext` | Expo push notifications; triggers reFetch on relevant events |
| `NavBarTitleContext` | Dynamic header title |

Providers are stacked in `app/_layout.tsx` in this order: Auth → Budget → BankTransactions → Notifications → Title → Paper/Theme.

### API Layer (`app/services/api.ts`)

Single Axios instance. A request interceptor automatically attaches the Bearer JWT from SecureStore to every request. Base URL is an ngrok tunnel (dev only) — update this for production.

Key endpoint groups: `user`, `budget`, `budgetcategory`, `spending`, `budgetinvite`, `bank`, `Transactions`, `currency`.

### Types (`types/Types.ts`)

All shared TypeScript types are defined here. Key types: `AppUser`, `Budget`, `BudgetCategory`, `Spending`, `BankTransaction`, `BudgetInvite`.

### Theming

Custom light/dark themes defined in `app/_layout.tsx` with primary color `#BADA55`. `ScreenContainer` component handles safe area insets and theme-aware backgrounds — use it as the root wrapper for all screens.

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`).
