import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useBudgets } from "@/context/BudgetContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Card, Icon, IconButton, MD2Colors, Portal, Snackbar } from "react-native-paper";


export default function CreateBudgetScreen() {
    const navigation = useNavigation();
    const { addBudget } = useBudgets();
    const { setTitle } = useTitle();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useFocusEffect(() => {
        setTitle("Invitations");
    });

    return (

        <ScreenContainer scrollable={true}>
            <OverlayLoader isVisible={loading} message='Creating budget...'></OverlayLoader>
            <Card key={0}>
                <Card.Title
                    title="test@test.test"
                    subtitle="Join 'Family' budget"
                    left={(props) => <Icon {...props} source="account-plus" />}
                    right={(props) => <View style={{ flexDirection: "row" }}>
                        <View style={{display: "flex", flexDirection: "column"}}>
                            <IconButton mode="contained" containerColor={MD2Colors.green900} icon="check" iconColor={MD2Colors.white} onPress={() => null} />
                            <IconButton mode="contained" containerColor={MD2Colors.red800} icon="close" iconColor={MD2Colors.white} onPress={() => null} />
                        </View>
                    </View>} />
            </Card>

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