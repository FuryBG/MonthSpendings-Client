import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Card, Icon, IconButton, MD2Colors, Portal, Snackbar } from "react-native-paper";
import { respondToInvite } from "../services/api";


export default function CreateBudgetScreen() {
    const navigation = useNavigation();
    const { user, reFetchAuth } = useAuth();
    const { setTitle } = useTitle();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useFocusEffect(() => {
        setTitle("Invitations");
    });

    async function onRespondToInvite(inviteId: number, accepted: boolean) {
        await respondToInvite(inviteId, accepted);
        await reFetchAuth();
    }

    return (

        <ScreenContainer scrollable={true}>
            <OverlayLoader isVisible={loading} message='Creating budget...'></OverlayLoader>
            {user?.receivedBudgetInvites.map(invite =>
                <Card key={invite.id} style={{ marginBottom: 12 }}>
                    <Card.Title
                        title={invite.receiverEmail}
                        subtitle="Join 'Family' budget"
                        left={(props) => <Icon {...props} source="account-plus" />}
                        right={(props) => <View style={{ flexDirection: "row" }}>
                            <View style={{ display: "flex", flexDirection: "column" }}>
                                {invite.accepted != null
                                    ? <IconButton mode="contained" icon={invite.accepted ? "check" : "close"} disabled={true} iconColor={MD2Colors.white} onPress={() => respondToInvite(invite.id, true)} />

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
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    duration={5000}
                    action={{
                        label: 'OK',
                        onPress: () => setVisible(false),
                    }}>
                    Create Budget failed.
                </Snackbar>
            </Portal>
        </ScreenContainer>

    );
}