import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useTitle } from "@/context/NavBarTitleContext";
import { BankOption } from "@/types/Types";
import * as Linking from 'expo-linking';
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, View } from "react-native";
import { Card, Portal, Searchbar, Snackbar, Text } from "react-native-paper";
import { getBanks, startBankConnection } from "../services/api";


export default function ConnectBankScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const [banks, setBanks] = useState<BankOption[]>([]);
    const [visible, setVisible] = useState(false);
    const { setTitle } = useTitle();
    const [loading, setLoading] = useState(false);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchBanks = async (bankName: string) => {
        try {
            setLoadingBanks(true);
            const banks = await getBanks(bankName);
            setBanks(banks);
            setLoadingBanks(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBanks('');
    }, []);

    const handleSearch = useCallback(
        debounce((text) => {
            console.log('Search:', text);
            fetchBanks(text);
        }, 300),
        []
    );

    const onChangeSearch = (text: string) => {
        setSearchQuery(text);
        handleSearch(text);
    };

    interface MenuuProps {
        fieldState: any;
        value: string;
        onChange: (val: string) => void;
    }

    async function onSelectBank(selectedBank: BankOption) {
        try {
            setLoading(true);
            var authUrl: string = await startBankConnection(selectedBank.name, selectedBank.country, selectedBank.logo, selectedBank.maximumConsentValidity);
            const redirectUrl = Linking.createURL('(main)/ConnectBankSuccess', { scheme: 'monthspendings' });
            console.log(redirectUrl);
            console.log("ASD");
            setLoading(false);
            const result = await WebBrowser.openAuthSessionAsync(authUrl);

        }
        catch (e) {
            console.log(e);
            setLoading(false);
        }
    }

    useFocusEffect(() => {
        setTitle("Select Bank");
    });

    return (

        <ScreenContainer scrollable={false}>
            <OverlayLoader isVisible={loadingBanks} message='Loading banks...'></OverlayLoader>
            <OverlayLoader isVisible={loading} message='Redirecting to Bank page...'></OverlayLoader>
            <Searchbar
                placeholder="Bank name..."
                onChangeText={onChangeSearch}
                value={searchQuery}
            />
            <FlatList
                data={banks}
                keyExtractor={(item) => `${item.name}-${item.country}`}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                renderItem={({ item }) => (
                    <Card style={{ margin: 10, padding: 20 }} onPress={() => onSelectBank(item)}>

                        <View style={{display: 'flex', justifyContent: 'center', flexDirection: 'row'}}>
                            <Image
                                source={{ uri: item.logo }}
                                resizeMode="contain"
                                style={{
                                    width: 80,
                                    height: 50
                                }}
                            />
                        </View>
                        <Card.Content style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                            <Text>{item.name}</Text>
                            <Text>{item.country}</Text>
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