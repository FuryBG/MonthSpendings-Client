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

### State Management

Global state is split between **Zustand stores** (persistent UI/auth state) and **TanStack React Query** (server data).

| Store (`stores/`) | Purpose |
|-------------------|---------|
| `authStore.ts` | JWT token (SecureStore), user profile, sign in/out |
| `budgetUIStore.ts` | Selected budget ID (AsyncStorage) |
| `snackbarStore.ts` | Toast notification queue |
| `titleStore.ts` | Dynamic header title |

Server data (budgets, categories, spendings, transactions) is fetched and cached via React Query. `NotificationContext` (in `context/`) handles Expo push notifications and triggers query invalidation on relevant events.

### API Layer (`app/services/api.ts`)

Single Axios instance. A request interceptor automatically attaches the Bearer JWT from `authStore` to every request. A response interceptor signs the user out on 401. Base URL is read from `EXPO_PUBLIC_API_URL` (falls back to a hardcoded ngrok URL for local dev — update this when the tunnel changes).

Key endpoint groups: `user`, `budget`, `budgetcategory`, `spending`, `budgetinvite`, `bank`, `Transactions`, `currency`.

### Types (`types/Types.ts`)

All shared TypeScript types are defined here. Key types: `AppUser`, `Budget`, `BudgetCategory`, `Spending`, `BankTransaction`, `BudgetInvite`.

### Theming

Custom light/dark themes defined in `app/_layout.tsx`. Primary color: `#5C7A1A` (light) / `#BADA55` (dark). `ScreenContainer` component handles safe area insets and theme-aware backgrounds — use it as the root wrapper for all screens.

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`).
