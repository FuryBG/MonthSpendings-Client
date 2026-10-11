import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getLegalContent } from '@/i18n/legal';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const doc = getLegalContent(i18n.language).privacy;
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
        <Text style={styles.headerTitle}>{doc.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.metaLabel}>{doc.lastUpdated}</Text>
        {doc.translationNotice ? <Text style={styles.notice}>{doc.translationNotice}</Text> : null}
        <Text style={styles.intro}>{doc.intro}</Text>

        {doc.sections.map((section, index) => (
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
  notice: {
    fontSize: 12,
    color: 'rgba(242,244,248,0.45)',
    lineHeight: 18,
    borderLeftWidth: 2,
    borderLeftColor: '#3EC6C6',
    paddingLeft: 10,
    marginBottom: 14,
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
