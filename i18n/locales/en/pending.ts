const pending = {
  empty: {
    title: 'All caught up',
    description: 'No transactions waiting to be categorized.\nNew wallet notifications will appear here automatically.',
  },
  categorize: 'Categorize',
  modalTitle: 'Categorize Transaction',
  fields: {
    amount: 'Amount',
    merchant: 'Merchant',
    budget: 'Budget',
    category: 'Category',
  },
  selectBudgetFirst: 'Select a budget first',
  rule: {
    title: 'Auto-categorize similar',
    description: 'Save this choice for future transactions from {{merchant}}',
  },
  delete: {
    title: 'Delete Transaction',
  },
};

export default pending;
