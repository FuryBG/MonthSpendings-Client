import { ModalRef } from "@/components/Modal";
import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { BankOption } from "@/types/Types";
import * as AuthSession from 'expo-auth-session';
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { Appbar, Avatar, Card, Portal, Snackbar, Text } from "react-native-paper";
import { getBanks, startBankConnection } from "../services/api";



export default function ConnectBankScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const modalRef = useRef<ModalRef>(null);
    const [banks, setBanks] = useState<BankOption[]>([]);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                console.log("START FETCH");

                const banks = await getBanks();
                console.log(banks.length);

                setBanks(banks);
            } catch (err) {
                console.error(err);
            }
        };

        fetchBanks();
    }, []);

    interface MenuuProps {
        fieldState: any;
        value: string;
        onChange: (val: string) => void;
    }

    async function onSelectBank(selectedBank: BankOption) {
        try {
            setLoading(true);

            var authUrl: string = await startBankConnection(selectedBank.name, selectedBank.country);
            console.log(authUrl);

            const redirectUrl = AuthSession.makeRedirectUri({
                scheme: 'exp+month-spendings',
                path: 'bank-auth-success',
            });

            setLoading(false);
            console.log("ASD");

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                redirectUrl
            );

            if (result.type == "success") {
                console.log("GGG");

            }
            else {
                console.log("NOT GGG");

            }

        }
        catch (e) {
            setLoading(false);
        }

    }

    useFocusEffect(
        useCallback(() => {
            navigation.setOptions({
                header: () => (
                    <Appbar.Header>
                        {router.canGoBack() && (
                            <Appbar.BackAction onPress={() => {
                                router.back();
                            }} />
                        )}
                        <Text style={{ flex: 1 }}>Select Bank</Text>
                        {/* <Appbar.Action icon="check" onPress={handleSubmit(onSubmit)} /> */}
                    </Appbar.Header>
                ),
            });
        }, [])
    );

    return (

        <ScreenContainer scrollable={false}>
            <OverlayLoader isVisible={loading} message='Redirecting to Bank page...'></OverlayLoader>

            <FlatList
                data={banks}
                keyExtractor={(item) => `${item.name}-${item.country}`}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                renderItem={({ item }) => (
                    <Card key={Math.random()} style={{ marginBottom: 12 }} onPress={() => onSelectBank(item)}>
                        <Card.Title
                            title={item.name + " " + item.country}
                            left={(props) => <Avatar.Icon {...props} icon="cash" />}
                        />
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