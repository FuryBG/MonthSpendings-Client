import { ScreenContainer } from "@/components/ScreenContainer";
import { useBankTransactions } from "@/context/BankTransactionsContext";
import { useTitle } from "@/context/NavBarTitleContext";
import { BankTransaction } from "@/types/Types";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { Button, Card, MD2Colors, Portal, Snackbar, Text } from "react-native-paper";


export default function PendingTransactions() {
    const navigation = useNavigation();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const { setTitle } = useTitle();
    const [loading, setLoading] = useState(false);
    const { transactions } = useBankTransactions();

    async function onSelectBank(selectedTransaction: BankTransaction) {

    }

    useFocusEffect(() => {
        setTitle("Transactions");
    });

    return (

        <ScreenContainer scrollable={false}>
            <FlatList
                data={transactions}
                keyExtractor={(item) => `${item.id}`}
                initialNumToRender={40}
                maxToRenderPerBatch={40}
                windowSize={5}
                renderItem={({ item }) => (
                    <Card style={{ margin: 10, padding: 5 }} onPress={() => onSelectBank(item)}>
                        <Card.Content style={{}}>
                            <View>
                                <View style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', paddingRight: 5 }}>Amount:</Text>
                                    <Text>{item.amount}</Text>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', paddingRight: 5 }}>Currency:</Text>
                                    <Text>{item.currency}</Text>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold', paddingRight: 5 }}>Date:</Text>
                                    <Text>{new Date(item.bookingDate).toLocaleString(undefined, { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</Text>
                                </View>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent:'flex-end', gap:10, paddingTop:25 }}>
                                <Button mode="contained">Add</Button>
                                <Button style={{backgroundColor: MD2Colors.red500}} mode="contained">Remove</Button>
                            </View>
                        </Card.Content>
                    </Card>
                )}
            />

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