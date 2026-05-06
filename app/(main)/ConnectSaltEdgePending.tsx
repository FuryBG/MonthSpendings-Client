import { getSaltEdgeConnectionStatus } from "@/app/services/api";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Tavira } from "@/constants/theme";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useTitleStore } from "@/stores/titleStore";
import { clearPendingSaltEdgeSessionId, getPendingSaltEdgeSessionId } from "@/utils/saltEdgeSession";
import { useFocusEffect, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

const POLL_INTERVAL_MS = 500;

export default function ConnectSaltEdgePendingScreen() {
    const router = useRouter();
    const showError = useSnackbarStore((s) => s.showError);
    const setTitle = useTitleStore((s) => s.setTitle);

    useFocusEffect(() => {
        setTitle("Connecting Bank");
    });

    useEffect(() => {
        let isMounted = true;
        let pollingId: ReturnType<typeof setInterval> | null = null;

        const goToError = async (message?: string) => {
            await clearPendingSaltEdgeSessionId();

            if (!isMounted) {
                return;
            }

            if (message) {
                showError(message);
            }

            router.replace("/(main)/ConnectSaltEdgeError");
        };

        const goToSuccess = async () => {
            await clearPendingSaltEdgeSessionId();

            if (!isMounted) {
                return;
            }

            router.replace("/(main)/ConnectSaltEdgeSuccess");
        };

        const startPolling = async () => {
            const localSessionId = await getPendingSaltEdgeSessionId();
            console.log(`GG: ${localSessionId}`);

            if (!localSessionId) {
                await goToError("Bank connection failed.");
                return;
            }

            const pollStatus = async () => {
                try {
                    const status = await getSaltEdgeConnectionStatus(localSessionId);

                    if (!isMounted) {
                        return;
                    }

                    if (status.state === "Connected") {
                        if (pollingId) {
                            clearInterval(pollingId);
                        }

                        await goToSuccess();
                        return;
                    }

                    if (status.state === "ConnectionFailed" || status.state === "Removed") {
                        if (pollingId) {
                            clearInterval(pollingId);
                        }

                        await goToError(status.errorMessage ?? "Bank connection failed.");
                    }
                } catch {
                    if (pollingId) {
                        clearInterval(pollingId);
                    }

                    await goToError("Bank connection failed.");
                }
            };

            await pollStatus();

            if (!isMounted) {
                return;
            }

            pollingId = setInterval(() => {
                void pollStatus();
            }, POLL_INTERVAL_MS);
        };

        void startPolling();

        return () => {
            isMounted = false;

            if (pollingId) {
                clearInterval(pollingId);
            }
        };
    }, [router, showError]);

    return (
        <ScreenContainer scrollable={false} glowColor="teal">
            <View style={pendingStyles.container}>
                <View style={pendingStyles.iconWrap}>
                    <View style={pendingStyles.iconGlow} />
                    <ActivityIndicator size={52} color={Tavira.teal} />
                </View>
                <Text style={pendingStyles.title}>Connecting your bank…</Text>
                <Text style={pendingStyles.subtitle}>{"This may take a moment. Please don't close the app."}</Text>
            </View>
        </ScreenContainer>
    );
}

const pendingStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 32,
    },
    iconWrap: {
        position: 'relative',
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconGlow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(62,198,198,0.12)',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F2F4F8',
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(242,244,248,0.45)',
        textAlign: 'center',
        lineHeight: 20,
    },
});
