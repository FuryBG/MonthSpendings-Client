import type { LegalContent } from './index';

const en: LegalContent = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: May 2025',
    intro: 'Please read these Terms of Service carefully before using the Tavira application. These terms govern your access to and use of all Tavira features.',
    sections: [
      {
        title: 'Acceptance of Terms',
        body: 'By accessing or using Tavira, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application. Your continued use of Tavira after any updates constitutes acceptance of the revised terms.',
      },
      {
        title: 'Use of the Service',
        body: 'Tavira is a personal budgeting tool intended solely for lawful personal finance management. You agree to use the service only for its intended purpose and in compliance with all applicable laws and regulations. Commercial use or resale of the service is strictly prohibited.',
      },
      {
        title: 'Account Registration',
        body: 'You must authenticate using a valid Google account to access Tavira. You are responsible for maintaining the confidentiality of your account and for all activities that occur under it. Notify us immediately if you suspect unauthorized access to your account.',
      },
      {
        title: 'Budgets and Financial Data',
        body: 'Financial data you enter into Tavira is stored securely and used solely to provide budgeting features. You retain ownership of all data you input into the application. We do not use your financial data for advertising or sell it to third parties.',
      },
      {
        title: 'Bank Account Integration',
        body: 'Tavira integrates with banking services via secure open-banking protocols. By connecting a bank account, you authorize Tavira to read transaction data on your behalf for budget tracking purposes. You may revoke bank access at any time through the app settings.',
      },
      {
        title: 'Prohibited Activities',
        body: 'You may not use Tavira to engage in fraudulent, illegal, or harmful activities. Attempting to reverse-engineer, scrape, or disrupt the service is strictly prohibited. Violations may result in immediate account termination and referral to appropriate authorities.',
      },
      {
        title: 'Termination',
        body: 'We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time through the app settings. Upon termination, your data will be handled in accordance with our Privacy Policy.',
      },
      {
        title: 'Changes to Terms',
        body: 'We may update these Terms of Service from time to time to reflect changes to the service or applicable law. Significant changes will be communicated via in-app notification or email. Continued use of Tavira after changes take effect constitutes your acceptance.',
      },
      {
        title: 'Contact Us',
        body: 'If you have questions or concerns about these Terms of Service, please reach out to us at support@taviraofficial.com. We aim to respond to all inquiries within 48 business hours.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: November 2026',
    intro: 'Your privacy matters to us. This policy explains what data Tavira collects, how it is used, and the choices you have regarding your information.',
    sections: [
      {
        title: 'Information We Collect',
        body: 'We collect the information you provide: your name, email address and profile photo through Google Sign-In, or your name, email address and a password hash if you register with email. We store the budgets, categories and expenses you enter. If you turn on Wallet Sync on Android, we receive the text of payment notifications from your wallet app and store the merchant, amount, currency, last four card digits and notification text. We also store your push notification token, language and time zone, and collect technical logs to operate and improve the service.',
      },
      {
        title: 'How We Use Your Information',
        body: 'Your information is used to provide, maintain, and improve the Tavira budgeting service. We use your data to personalize your experience, send you relevant notifications, and respond to support requests.',
      },
      {
        title: 'Data Sharing',
        body: 'We do not sell or rent your personal information. We share data with trusted service providers who help operate Tavira: RevenueCat (subscription management), Google and Expo (sign-in and push notifications), and our hosting and database providers. These providers process certain data in accordance with their own privacy policies. We may also disclose information if required by law or to protect user rights.',
      },
      {
        title: 'Data Security',
        body: 'We implement industry-standard security measures including encryption in transit (TLS) and at rest to protect your data. Access to user data is restricted to authorized personnel only. While we strive to protect your information, no method of transmission over the internet is completely secure.',
      },
      {
        title: 'Data Retention',
        body: 'We keep your personal data while your account is active. When you delete your account in the app, your account and associated data are permanently removed from our database right away. Requests sent by email are completed within 30 days. Technical logs tied to an internal numeric ID, and database backups, are removed within 30 days. We also ask RevenueCat to delete your customer record. Google and Apple keep purchase records under their own policies. We keep other data only where the law requires it. Details: https://api.taviraofficial.com/delete-account',
      },
      {
        title: 'Your Rights',
        body: 'You have the right to access, correct, or delete the personal information we hold about you. To delete your account, use Settings in the app or follow the steps at https://api.taviraofficial.com/delete-account. For any other request, contact us at support@taviraofficial.com.',
      },
      {
        title: "Children's Privacy",
        body: 'Tavira is not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it promptly.',
      },
      {
        title: 'Changes to This Policy',
        body: 'We may update this Privacy Policy periodically to reflect changes in our practices or applicable regulations. Material changes will be communicated through the app or via email. Your continued use of Tavira after changes are posted constitutes your acceptance of the updated policy.',
      },
      {
        title: 'Contact Us',
        body: 'If you have any questions about this Privacy Policy or how we handle your data, please contact us at support@taviraofficial.com. We are committed to addressing privacy concerns promptly and transparently.',
      },
    ],
  },
};

export default en;
