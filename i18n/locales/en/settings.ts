const settings = {
  title: 'Settings',
  sections: {
    notifications: 'NOTIFICATIONS',
    security: 'SECURITY',
    general: 'GENERAL',
    dangerZone: 'DANGER ZONE',
  },
  notificationsOff: {
    title: 'Notifications off',
    tapToEnable: 'Tap to receive notifications for spendings, invites and wallet sync',
    openSettings: 'Enable Notifications to receive alerts for spendings, invites and wallet sync',
  },
  walletSync: {
    label: 'Wallet Sync',
    description: 'Reads payment notifications to log transactions automatically.',
    proHint: 'Upgrade to Tavira Pro to enable Wallet Sync.',
    notificationsHint: 'Notifications must be enabled to use this feature.',
  },
  lockApp: {
    label: 'Lock App',
    description: 'Require biometrics or device PIN to open Tavira.',
  },
  hideAmounts: {
    label: 'Hide Amounts',
    description: 'Mask all amounts across the app.',
  },
  language: {
    label: 'Language',
    sheetTitle: 'App language',
    followingPhone: "Matching your phone's language. Pick one to keep it fixed.",
    changed: 'Language updated.',
    names: {
      en: 'English',
      bg: 'Bulgarian',
      es: 'Spanish',
    },
  },
  appTour: {
    label: 'Show App Tour',
    description: 'Replay the guided walkthrough',
  },
  deleteAccount: {
    title: 'Delete Account',
    message: 'Your request will be reviewed. Your account and all associated data will be permanently deleted within 30 days. This cannot be undone.',
    confirm: 'Request Deletion',
    submitted: 'Deletion request submitted. We will process it within 30 days.',
    failed: 'Failed to submit request. Please try again.',
  },
  version: {
    label: 'VERSION',
    embedded: 'Embedded build',
  },
  messages: {
    notificationsEnabled: 'Notifications enabled.',
    noDeviceLock: 'No biometrics or device PIN set up. Enable a screen lock in your device settings first.',
    walletSyncEnableFailed: 'Failed to enable Wallet Sync. Please try again.',
    walletSyncAccessRequired: 'Notification access is required for Wallet Sync.',
    walletSyncUpdateFailed: 'Failed to update Wallet Sync. Please try again.',
  },
  intro: {
    title: 'App Settings',
    lockApp: 'Lock App requires biometrics or your device PIN when reopening Tavira',
    walletSync: 'Wallet Sync (Pro) reads payment notifications to log transactions automatically',
    amounts: 'Amount visibility can also be toggled from the home screen header',
    language: 'Language follows your phone by default — change it here any time',
    appTour: 'Tap "Show App Tour" above to replay this walkthrough any time',
  },
};

export default settings;
