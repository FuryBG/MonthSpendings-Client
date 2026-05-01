import { getSaltEdgeConnectionStatus } from "@/app/services/api";
import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useTitleStore } from "@/stores/titleStore";
import { clearPendingSaltEdgeSessionId, getPendingSaltEdgeSessionId } from "@/utils/saltEdgeSession";
import { useFocusEffect, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native-paper";

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
        <ScreenContainer scrollable={false}>
            <OverlayLoader isVisible={true} message="Finalizing bank connection..." />
            <Text style={{ textAlign: "center" }}>Finalizing bank connection...</Text>
        </ScreenContainer>
    );
}
