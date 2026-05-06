import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Tavira } from "@/constants/theme";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useTitleStore } from "@/stores/titleStore";
import { BudgetInvite } from "@/types/Types";
import { useFocusEffect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";
import { respondToInvite } from "../services/api";

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
    const { colors } = useTheme();
    const fade = useRef(new Animated.Value(0)).current;
    const rise = useRef(new Animated.Value(28)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 680, delay: 120, useNativeDriver: true }),
            Animated.timing(rise, { toValue: 0, duration: 560, delay: 120, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[s.emptyWrap, { opacity: fade, transform: [{ translateY: rise }] }]}>
            <View style={s.rings}>
                <View style={[s.ring, s.ring3, { borderColor: colors.primary, opacity: 0.08 }]} />
                <View style={[s.ring, s.ring2, { borderColor: colors.primary, opacity: 0.15 }]} />
                <View style={[s.ring, s.ring1, { borderColor: colors.primary, opacity: 0.25 }]} />
                <View style={[s.iconCircle, { backgroundColor: colors.secondaryContainer }]}>
                    <Icon source="email-outline" size={46} color={colors.primary} />
                </View>
            </View>
            <Text style={[s.emptyTitle, { color: colors.onBackground }]}>No invitations yet</Text>
            <Text style={[s.emptySub, { color: colors.onSurfaceVariant }]}>
                {"When someone invites you to\njoin a budget, it'll appear here."}
            </Text>
        </Animated.View>
    );
}

// ─── Invite Card ──────────────────────────────────────────────────────────────

interface InviteCardProps {
    invite: BudgetInvite;
    index: number;
    onRespond: (id: number, accepted: boolean) => void;
}

function InviteCard({ invite, index, onRespond }: InviteCardProps) {
    const { colors } = useTheme();
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(32)).current;

    useEffect(() => {
        const delay = index * 65;
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    const isPending = invite.accepted === null;
    const isAccepted = invite.accepted === true;
    const isDark = colors.background === Tavira.navy;

    const accentColor = isPending ? Tavira.teal : isAccepted ? Tavira.income : Tavira.expense;

    const expiry = invite.validTo
        ? new Date(invite.validTo).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;

    const status = !isPending
        ? { label: isAccepted ? 'Accepted' : 'Declined', color: isAccepted ? Tavira.income : Tavira.expense }
        : null;

    const budgetLabel = invite.budgetName || `Budget #${invite.budgetId}`;
    const senderLabel = invite.senderName || invite.senderEmail || 'Unknown';

    return (
        <Animated.View style={[c.card, { backgroundColor: isDark ? Tavira.glassBg : colors.surface, borderColor: isDark ? Tavira.glassBorder : 'transparent', borderWidth: isDark ? 1 : 0, opacity: fade, transform: [{ translateY: slide }] }]}>
            <View style={[c.accent, { backgroundColor: accentColor }]} />
            <View style={c.body}>

                {/* Budget name + status pill */}
                <View style={c.headerRow}>
                    <View style={[c.iconBox, { backgroundColor: colors.secondaryContainer }]}>
                        <Icon source="wallet-outline" size={20} color={colors.primary} />
                    </View>
                    <Text style={[c.budgetName, { color: colors.onSurface }]} numberOfLines={1}>{budgetLabel}</Text>
                    {status && (
                        <View style={[c.pill, { borderColor: status.color }]}>
                            <Text style={[c.pillText, { color: status.color }]}>{status.label}</Text>
                        </View>
                    )}
                </View>

                {/* Sender info */}
                <View style={c.senderRow}>
                    <Icon source="account-outline" size={14} color={colors.onSurfaceVariant} />
                    <Text style={[c.senderText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                        Invited by {senderLabel}
                    </Text>
                </View>

                <View style={[c.divider, { backgroundColor: colors.outline }]} />

                {/* Expiry */}
                {expiry && (
                    <View style={c.expiryRow}>
                        <Icon source="clock-outline" size={12} color={colors.onSurfaceVariant} />
                        <Text style={[c.expiryText, { color: colors.onSurfaceVariant }]}>Expires {expiry}</Text>
                    </View>
                )}

                {/* Action buttons — own row so they never get clipped */}
                {isPending && (
                    <View style={c.actions}>
                        <Pressable
                            onPress={() => onRespond(invite.id, false)}
                            style={({ pressed }) => [c.btn, c.btnOutline, { borderColor: colors.error, opacity: pressed ? 0.6 : 1 }]}
                        >
                            <Text style={[c.btnText, { color: colors.error }]}>Decline</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => onRespond(invite.id, true)}
                            style={({ pressed }) => [c.btn, c.btnFill, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}
                        >
                            <Text style={[c.btnText, { color: colors.onPrimary }]}>Accept</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InvitesScreen() {
    const user = useAuthStore((s) => s.user);
    const restoreSession = useAuthStore((s) => s.restoreSession);
    const showError = useSnackbarStore((s) => s.showError);
    const showSuccess = useSnackbarStore((s) => s.showSuccess);
    const setTitle = useTitleStore((s) => s.setTitle);
    const [loading, setLoading] = useState(false);

    useFocusEffect(() => {
        setTitle("Invitations");
    });

    async function onRespondToInvite(inviteId: number, accepted: boolean) {
        try {
            setLoading(true);
            await respondToInvite(inviteId, accepted);
            await restoreSession();
            if (accepted) {
                await queryClient.invalidateQueries({ queryKey: ['budgets'] });
            }
            showSuccess(accepted ? "Invite accepted." : "Invite declined.");
        } catch {
            showError("Failed to respond to invite.");
        } finally {
            setLoading(false);
        }
    }

    if (!user) return null;

    return (
        <ScreenContainer scrollable={true}>
            <OverlayLoader isVisible={loading} message='Processing...' />
            {user.receivedBudgetInvites.length === 0 ? (
                <EmptyState />
            ) : (
                <View style={s.list}>
                    {user.receivedBudgetInvites.map((invite, i) => (
                        <InviteCard key={invite.id} invite={invite} index={i} onRespond={onRespondToInvite} />
                    ))}
                </View>
            )}
        </ScreenContainer>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    list: {
        padding: 16,
        gap: 12,
    },
    emptyWrap: {
        alignItems: 'center',
        paddingTop: 88,
        paddingHorizontal: 40,
    },
    rings: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    ring: {
        position: 'absolute',
        borderWidth: 1,
        borderRadius: 999,
    },
    ring3: { width: 210, height: 210 },
    ring2: { width: 158, height: 158 },
    ring1: { width: 116, height: 116 },
    iconCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.4,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        opacity: 0.8,
    },
});

const c = StyleSheet.create({
    card: {
        borderRadius: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
    },
    accent: {
        width: 4,
    },
    body: {
        flex: 1,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    budgetName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    pill: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        flexShrink: 0,
    },
    pillText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    senderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 6,
        paddingLeft: 50,
    },
    senderText: {
        fontSize: 13,
        flex: 1,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 12,
        opacity: 0.4,
    },
    expiryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 10,
    },
    expiryText: {
        fontSize: 11,
        opacity: 0.85,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    btn: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnOutline: {
        borderWidth: 1,
    },
    btnFill: {},
    btnText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
});
