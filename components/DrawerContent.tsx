import { useAuthStore } from "@/stores/authStore";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

type NavItemProps = {
    icon: string;
    label: string;
    onPress: () => void;
    badge?: number;
    destructive?: boolean;
};

function NavItem({ icon, label, onPress, badge, destructive }: NavItemProps) {
    const theme = useTheme();
    const color = destructive ? theme.colors.error : theme.colors.onBackground;
    const iconBg = destructive
        ? theme.colors.error + '18'
        : theme.colors.surfaceVariant;

    return (
        <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.65}>
            <View style={[styles.navIconWrap, { backgroundColor: iconBg }]}>
                <Icon source={icon} size={20} color={color} />
            </View>
            <Text style={[styles.navLabel, { color }]}>{label}</Text>
            {badge != null && (
                <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>{badge}</Text>
                </View>
            )}
            {badge == null && !destructive && (
                <Icon source="chevron-right" size={16} color={theme.colors.onBackground + '35'} />
            )}
        </TouchableOpacity>
    );
}

function SectionLabel({ label }: { label: string }) {
    const theme = useTheme();
    return (
        <Text style={[styles.sectionLabel, { color: theme.colors.onBackground }]}>{label}</Text>
    );
}

export function DrawerContent(props: any) {
    const theme = useTheme();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const signOut = useAuthStore((s) => s.signOut);

    if (!user) return null;

    const initials = [user.firstName, user.lastName]
        .filter(Boolean)
        .map(n => n[0].toUpperCase())
        .join('') || user.email[0].toUpperCase();

    const pendingInvites = user.receivedBudgetInvites.filter(i => i.accepted === null).length;

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={[styles.contentContainer, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.inner}>
                {/* Top: profile + nav */}
                <View>
                    {/* Profile header */}
                    <View style={[styles.profileSection, { borderBottomColor: theme.colors.outline }]}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.initials, { color: theme.colors.onPrimary }]}>{initials}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            {(user.firstName || user.lastName) ? (
                                <Text style={[styles.profileName, { color: theme.colors.onBackground }]} numberOfLines={1}>
                                    {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                                </Text>
                            ) : null}
                            <Text style={[styles.profileEmail, { color: theme.colors.onBackground }]} numberOfLines={1}>
                                {user.email}
                            </Text>
                        </View>
                    </View>

                    {/* Budgets */}
                    <View style={styles.section}>
                        <SectionLabel label="BUDGETS" />
                        <NavItem
                            icon="wallet-plus-outline"
                            label="Create Budget"
                            onPress={() => router.push('/(main)/CreateBudget')}
                        />
                    </View>

                    {/* Savings */}
                    <View style={[styles.section, { borderTopColor: theme.colors.outline }]}>
                        <SectionLabel label="SAVINGS" />
                        <NavItem
                            icon="piggy-bank-outline"
                            label="Savings Pots"
                            onPress={() => router.push('/(main)/SavingsPots')}
                        />
                    </View>

                    {/* Banking */}
                    <View style={[styles.section, { borderTopColor: theme.colors.outline }]}>
                        <SectionLabel label="BANKING" />
                        <NavItem
                            icon="bank-outline"
                            label="Connect Bank"
                            onPress={() => router.push('/(main)/ConnectBank')}
                        />
                        <NavItem
                            icon="bank-plus"
                            label="Connect Salt Edge Bank"
                            onPress={() => router.push('/(main)/ConnectSaltEdgeBank')}
                        />
                    </View>

                    {/* Account */}
                    <View style={[styles.section, { borderTopColor: theme.colors.outline }]}>
                        <SectionLabel label="ACCOUNT" />
                        <NavItem
                            icon="email-outline"
                            label="Invitations"
                            badge={pendingInvites > 0 ? pendingInvites : undefined}
                            onPress={() => router.push('/(main)/Invites')}
                        />
                    </View>
                </View>

                {/* Bottom: logout */}
                <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
                    <NavItem
                        icon="logout"
                        label="Sign Out"
                        destructive
                        onPress={async () => await signOut()}
                    />
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
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    profileInfo: {
        flex: 1,
        gap: 3,
    },
    profileName: {
        fontSize: 15,
        fontWeight: '700',
    },
    profileEmail: {
        fontSize: 12,
        opacity: 0.5,
    },
    section: {
        paddingHorizontal: 12,
        paddingTop: 20,
        paddingBottom: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        opacity: 0.35,
        paddingHorizontal: 8,
        marginBottom: 4,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 10,
        minHeight: 48,
    },
    navIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    footer: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
});
