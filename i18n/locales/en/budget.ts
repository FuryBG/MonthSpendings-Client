const budget = {
  fields: {
    name: 'Budget name',
    selectCurrency: 'Select currency',
    categoryName: 'Category name',
    amount: 'Amount',
    startingAmount: 'Starting amount',
  },
  validation: {
    nameRequired: 'Budget name is required',
    currencyRequired: 'Currency is required',
    categoryNameRequired: 'Name is required',
    startingAmountRequired: 'Starting amount is required',
  },
  currencySheet: {
    title: 'Select Currency',
  },
  create: {
    submit: 'Create',
    creating: 'Creating budget...',
    detailsSection: 'BUDGET DETAILS',
    categoriesSection: 'CATEGORIES',
    addCategory: 'Add Category',
    intro: {
      title: 'Creating a Budget',
      name: 'Give your budget a descriptive name',
      currency: 'All amounts in this budget will use the selected currency',
      categories: 'Add categories and set a starting balance for each spending envelope',
      invite: 'After creating, invite collaborators from Budget Settings',
    },
  },
  manage: {
    pendingInvitations: 'Pending Invitations',
    members: 'Members',
    you: 'You',
    categories: 'Categories',
    invite: {
      title: 'Invite Member',
      emailLabel: 'Email address',
      send: 'Send Invite',
    },
    rename: {
      title: 'Rename — {{name}}',
    },
    addCategory: {
      title: 'Add Category',
    },
    deleteCategory: {
      title: 'Delete Category',
      message: 'Delete "{{name}}"? All spending history for this category will be removed.',
    },
    period: {
      title: 'Budget Period',
      description: 'Closes the current period. Choose whether to start the next period fresh or carry remaining balances into a single category.',
    },
    finish: {
      title: 'Finish Period',
      fresh: {
        label: 'Start Fresh',
        description: 'No balances carry to the next period',
      },
      sumIntoOne: {
        label: 'Carry into Category',
        description: 'Sum all remaining balances into one spot',
      },
      keepSame: {
        label: 'Carry Each Category',
        description: "Each category's remaining rolls into the next period",
      },
    },
    deleteBudget: {
      title: 'Delete Budget',
      subtitle: 'Removes all categories and history',
      message: 'Permanently delete "{{name}}"? All spending categories and their history will be lost. This cannot be undone.',
    },
    kick: {
      title: 'Remove Member',
      message: 'Remove {{name}} from this budget? They will be notified.',
      confirm: 'Remove',
      fallbackName: 'this member',
    },
    leave: {
      title: 'Leave Budget',
      message: 'Leave "{{name}}"? You will lose access to all transactions and categories.',
      confirm: 'Leave',
    },
    messages: {
      categoryDeleted: 'Category deleted.',
      categoryDeleteFailed: 'Deleting category was not successful.',
      budgetDeleteFailed: 'Deleting budget was not successful.',
      categoryCreated: 'Category created.',
      categoryCreateFailed: 'Creating category was not successful.',
      categoryRenamed: 'Category renamed.',
      categoryRenameFailed: 'Renaming category was not successful.',
      inviteSent: 'Invite sent.',
      inviteFailed: 'Sending invite was not successful.',
      periodFinished: 'Budget period finished successfully.',
      periodFinishFailed: 'Finishing period was not successful.',
      memberRemoved: '{{name}} removed.',
      memberRemoveFailed: 'Removing member was not successful.',
      leaveFailed: 'Leaving budget was not successful.',
    },
  },
};

export default budget;
