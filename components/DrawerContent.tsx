import { Tavira } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

type NavItemProps = {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
  accent?: string;
  soon?: boolean;
};

function NavItem({ icon, label, onPress, badge, destructive, accent, soon }: NavItemProps) {
  const theme = useTheme();
  const isDark = theme.dark;
  const iconColor = destructive
    ? Tavira.expense
    : accent ?? (isDark ? Tavira.teal : theme.colors.primary);
  const iconBg = destructive
    ? 'rgba(255,107,107,0.12)'
    : accent
      ? `${accent}18`
      : isDark ? 'rgba(62,198,198,0.10)' : theme.colors.surfaceVariant;
  const labelColor = destructive
    ? Tavira.expense
    : isDark ? '#F2F4F8' : theme.colors.onBackground;

  return (
    <TouchableOpacity
      style={[styles.navItem, soon && styles.navItemDisabled]}
      onPress={soon ? undefined : onPress}
      activeOpacity={soon ? 1 : 0.65}
      disabled={soon}
    >
      <View style={[styles.navIconWrap, { backgroundColor: iconBg, opacity: soon ? 0.45 : 1 }]}>
        <Icon source={icon} size={19} color={iconColor} />
      </View>
      <Text style={[styles.navLabel, { color: labelColor, opacity: soon ? 0.45 : 1 }]}>{label}</Text>
      {soon && (
        <View style={styles.soonBadge}>
          <Text style={styles.soonText}>SOON</Text>
        </View>
      )}
      {!soon && badge != null && (
        <View style={[styles.badge, { backgroundColor: Tavira.teal }]}>
          <Text style={[styles.badgeText, { color: Tavira.navy }]}>{badge}</Text>
        </View>
      )}
      {!soon && badge == null && !destructive && (
        <Icon source="chevron-right" size={15} color={isDark ? 'rgba(242,244,248,0.2)' : 'rgba(11,27,58,0.2)'} />
      )}
    </TouchableOpacity>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label}</Text>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export function DrawerContent(props: any) {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  if (!user) return null;

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join('') || user.email[0].toUpperCase();

  const pendingInvites = user.receivedBudgetInvites.filter(i => i.accepted === null).length;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.contentContainer,
        { backgroundColor: isDark ? Tavira.navy : theme.colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        <View>
          {/* Avatar + profile */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRingOuter} />
              <LinearGradient
                colors={Tavira.gradTeal}
                style={styles.avatarRing}
              >
                <View style={[styles.avatar, { backgroundColor: isDark ? '#0F2244' : theme.colors.surfaceVariant }]}>
                  <Text style={[styles.initials, { color: isDark ? Tavira.teal : theme.colors.primary }]}>
                    {initials}
                  </Text>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              {fullName ? (
                <Text style={[styles.profileName, { color: isDark ? '#F2F4F8' : theme.colors.onBackground }]} numberOfLines={1}>
                  {fullName}
                </Text>
              ) : null}
              <Text
                style={[styles.profileEmail, { color: isDark ? 'rgba(242,244,248,0.45)' : theme.colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {user.email}
              </Text>
            </View>
          </View>

          <Divider />

          {/* Budgets */}
          <View style={styles.section}>
            <SectionLabel label="BUDGETS" />
            <NavItem
              icon="wallet-plus-outline"
              label="Create Budget"
              accent={Tavira.teal}
              onPress={() => router.push('/(main)/CreateBudget')}
            />
          </View>

          <Divider />

          {/* Savings */}
          <View style={styles.section}>
            <SectionLabel label="SAVINGS" />
            <NavItem
              icon="piggy-bank-outline"
              label="Savings Pots"
              accent={Tavira.purple}
              onPress={() => router.push('/(main)/SavingsPots')}
            />
          </View>

          <Divider />

          {/* Banking */}
          <View style={styles.section}>
            <SectionLabel label="BANKING" />
            <NavItem
              icon="bank-plus"
              label="Connect Bank"
              accent="#2DE6D0"
              soon
              onPress={() => router.push('/(main)/ConnectSaltEdgeBank')}
            />
          </View>

          <Divider />

          {/* Account */}
          <View style={styles.section}>
            <SectionLabel label="ACCOUNT" />
            <NavItem
              icon="email-outline"
              label="Invitations"
              badge={pendingInvites > 0 ? pendingInvites : undefined}
              accent={Tavira.purple}
              onPress={() => router.push('/(main)/Invites')}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Divider />
          <View style={styles.section}>
            <NavItem
              icon="logout"
              label="Sign Out"
              destructive
              onPress={async () => await signOut()}
            />
          </View>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
  },
  avatarContainer: {
    position: 'relative',
    width: 54,
    height: 54,
  },
  avatarRingOuter: {
    position: 'absolute',
    inset: -3,
    borderRadius: 30,
    backgroundColor: 'rgba(62,198,198,0.08)',
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  profileEmail: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 20,
  },
  section: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: 'rgba(62,198,198,0.65)',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    minHeight: 48,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  navItemDisabled: {
    opacity: 0.7,
  },
  soonBadge: {
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  soonText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#F59E0B',
  },
  footer: {
    paddingBottom: 12,
  },
});
