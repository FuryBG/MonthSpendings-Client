import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide directly, including your name, email address, and profile photo obtained via Google Sign-In. We also collect financial data you enter manually and transaction data synced from connected bank accounts. Usage data such as feature interactions and error logs may be collected to improve the service.',
  },
  {
    title: 'How We Use Your Information',
    body: 'Your information is used to provide, maintain, and improve the Tavira budgeting service. We use your data to personalize your experience, send you relevant notifications, and respond to support requests. We do not use your financial data to serve you advertisements.',
  },
  {
    title: 'Bank Account Data',
    body: 'When you connect a bank account, Tavira accesses read-only transaction data via secure open-banking APIs. This data is used exclusively to populate your transaction history and assist with budget tracking. We do not store your banking credentials and never initiate transactions on your behalf.',
  },
  {
    title: 'Data Sharing',
    body: 'We do not sell, rent, or trade your personal or financial information to third parties. We may share data with trusted service providers who assist in operating Tavira, subject to strict confidentiality agreements. We may disclose information if required to do so by law or to protect the rights of our users.',
  },
  {
    title: 'Data Security',
    body: 'We implement industry-standard security measures including encryption in transit (TLS) and at rest to protect your data. Access to user data is restricted to authorized personnel only. While we strive to protect your information, no method of transmission over the internet is completely secure.',
  },
  {
    title: 'Data Retention',
    body: 'We retain your personal and financial data for as long as your account remains active or as needed to provide the service. If you delete your account, your data will be permanently removed within 30 days, except where retention is required by law. Bank transaction history linked to revoked consents is deleted promptly.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, correct, or delete the personal information we hold about you. You may export your budget data or disconnect bank accounts at any time through the app settings. To exercise any of these rights, contact us at support@tavira.app.',
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
    body: 'If you have any questions about this Privacy Policy or how we handle your data, please contact us at support@tavira.app. We are committed to addressing privacy concerns promptly and transparently.',
  },
];

export default function PrivacyPolicyScreen() {
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
          <Icon source="arrow-left" size={20} color="#5B7BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.metaLabel}>Last updated: May 2025</Text>
        <Text style={styles.intro}>
          Your privacy matters to us. This policy explains what data Tavira collects, how it is used, and the choices you have regarding your information.
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
    position: 'absolute', top: -50, left: -70,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(91,123,255,0.06)',
  },
  orb2: {
    position: 'absolute', bottom: 100, right: -70,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(62,198,198,0.05)',
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
    backgroundColor: 'rgba(91,123,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(91,123,255,0.20)',
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
    backgroundColor: '#5B7BFF',
  },
  sectionIndex: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(91,123,255,0.45)',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#5B7BFF',
    letterSpacing: 1.3,
  },
  sectionBody: {
    fontSize: 14,
    color: 'rgba(242,244,248,0.60)',
    lineHeight: 22,
  },
});
