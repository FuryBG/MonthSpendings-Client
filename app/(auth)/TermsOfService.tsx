import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SECTIONS = [
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
    body: 'If you have questions or concerns about these Terms of Service, please reach out to us at support@tavira.app. We aim to respond to all inquiries within 48 business hours.',
  },
];

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, delay: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, delay: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0B1B3A', '#071228', '#050E1F']} style={styles.root}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Icon source="arrow-left" size={20} color="#3EC6C6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.metaLabel}>Last updated: May 2025</Text>
        <Text style={styles.intro}>
          Please read these Terms of Service carefully before using the Tavira application. These terms govern your access to and use of all Tavira features.
        </Text>

        {SECTIONS.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.accent} />
              <Text style={styles.sectionIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            </View>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: {
    position: 'absolute', top: -50, right: -70,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(62,198,198,0.06)',
  },
  orb2: {
    position: 'absolute', bottom: 100, left: -70,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(91,123,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: {
    width: 38, height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(62,198,198,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(62,198,198,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#F2F4F8',
    letterSpacing: 0.3,
  },
  headerSpacer: { width: 38 },
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  metaLabel: {
    fontSize: 10,
    color: 'rgba(242,244,248,0.25)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  intro: {
    fontSize: 14,
    color: 'rgba(242,244,248,0.50)',
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  accent: {
    width: 3, height: 14,
    borderRadius: 2,
    backgroundColor: '#3EC6C6',
  },
  sectionIndex: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(62,198,198,0.45)',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#3EC6C6',
    letterSpacing: 1.3,
  },
  sectionBody: {
    fontSize: 14,
    color: 'rgba(242,244,248,0.60)',
    lineHeight: 22,
  },
});
