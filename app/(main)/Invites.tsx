import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuthStore } from "@/stores/authStore";
import { useTitleStore } from "@/stores/titleStore";
import { useFocusEffect } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Icon, IconButton, MD2Colors, Portal, Snackbar } from "react-native-paper";
import { respondToInvite } from "../services/api";

export default function InvitesScreen() {
    const user = useAuthStore((s) => s.user);
    const restoreSession = useAuthStore((s) => s.restoreSession);
    const setTitle = useTitleStore((s) => s.setTitle);
    const [errorVisible, setErrorVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useFocusEffect(() => {
        setTitle("Invitations");
    });

    async function onRespondToInvite(inviteId: number, accepted: boolean) {
        try {
            setLoading(true);
            await respondToInvite(inviteId, accepted);
            await restoreSession();
            setLoading(false);
        } catch {
            setErrorVisible(true);
            setLoading(false);
        }
    }

    if (!user) return null;

    return (
        <ScreenContainer scrollable={true}>
            <OverlayLoader isVisible={loading} message='Processing...' />
            {user.receivedBudgetInvites.map(invite =>
                <Card key={invite.id} style={styles.card}>
                    <Card.Title
                        title={invite.receiverEmail}
                        subtitle="Join 'Family' budget"
                        left={(props) => <Icon {...props} source="account-plus" />}
                        right={() => <View style={styles.actionColumn}>
                            <View style={styles.column}>
                                {invite.accepted != null
                                    ? <IconButton mode="contained" icon={invite.accepted ? "check" : "close"} disabled={true} iconColor={MD2Colors.white} onPress={() => null} />
                                    : <>
                                        <IconButton mode="contained" containerColor={MD2Colors.green900} icon="check" iconColor={MD2Colors.white} onPress={() => onRespondToInvite(invite.id, true)} />
                                        <IconButton mode="contained" containerColor={MD2Colors.red800} icon="close" iconColor={MD2Colors.white} onPress={() => onRespondToInvite(invite.id, false)} />
                                    </>}
                            </View>
                        </View>} />
                </Card>
            )}
            <Portal>
                <Snackbar
                    visible={errorVisible}
                    onDismiss={() => setErrorVisible(false)}
                    duration={5000}
                    action={{
                        label: 'OK',
                        onPress: () => setErrorVisible(false),
                    }}>
                    Operation failed.
                </Snackbar>
            </Portal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
    },
    actionColumn: {
        flexDirection: 'row',
    },
    column: {
        flexDirection: 'column',
    },
});
