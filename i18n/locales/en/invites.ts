const invites = {
  empty: {
    title: 'No invitations yet',
    description: "When someone invites you to\njoin a budget, it'll appear here.",
  },
  status: {
    accepted: 'Accepted',
    declined: 'Declined',
  },
  budgetFallback: 'Budget #{{id}}',
  unknownSender: 'Unknown',
  invitedBy: 'Invited by {{name}}',
  expires: 'Expires {{date}}',
  decline: 'Decline',
  accept: 'Accept',
  messages: {
    accepted: 'Invite accepted.',
    declined: 'Invite declined.',
    respondFailed: 'Failed to respond to invite.',
  },
};

export default invites;
