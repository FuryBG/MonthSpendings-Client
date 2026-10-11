const tour = {
  skip: 'Skip',
  next: 'Next →',
  done: 'Done',
  home: {
    budgetHeader: {
      title: 'Your Active Budget',
      description: 'Shows your selected budget name and currency. Tap the budget pill in the top bar to switch budgets or create a new one.',
    },
    categoryCard: {
      title: 'Spending Categories',
      description: 'Each card is a spending envelope. The balance shows what remains this period. Long-press any card to reorder or swipe left to edit name.',
    },
    cardActions: {
      title: 'Add or Spend',
      description: 'Tap + to top up a category, or − to record a spend. Tap the card itself to see the full transaction history.',
    },
    eyeToggle: {
      title: 'Hide Amounts',
      description: 'Tap the eye icon in the header to mask all balances — handy when your screen is visible to others.',
    },
    menuButton: {
      title: 'Navigation Menu',
      description: 'Open the menu to access Settings, view Invitations, and manage or create budgets.',
    },
    pendingBanner: {
      title: 'Pending Transactions',
      description: 'When Wallet Sync is enabled, bank payment notifications appear here for you to categorize into your budget.',
    },
  },
  manage: {
    header: {
      title: 'Budget Overview',
      description: 'Shows the budget name and currency. Each budget is a separate spending envelope you can share with others.',
    },
    members: {
      title: 'Members & Invites',
      description: 'Tap Invite Member to share this budget by email. Shared members can add and view spending in real time.',
    },
    categories: {
      title: 'Categories',
      description: 'Add, rename, or remove spending categories. Each category tracks its own balance independently.',
    },
    period: {
      title: 'Finish Period',
      description: 'Close the current month and choose how to handle remaining balances — start fresh, carry into one category, or keep each.',
    },
  },
  spending: {
    periods: {
      title: 'Browse Periods',
      description: 'Tap a period chip to switch between months and review your full spending history.',
    },
    summary: {
      title: 'Period Summary',
      description: 'Shows net balance, total income added, and total spent for the selected period.',
    },
    actions: {
      title: 'Record Transactions',
      description: 'Tap Spend to deduct from this category, or Add Funds to top it up. Swipe left on any transaction to delete it.',
    },
  },
};

export default tour;
