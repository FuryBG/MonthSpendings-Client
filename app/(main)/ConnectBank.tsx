import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useTitleStore } from "@/stores/titleStore";
import { BankOption } from "@/types/Types";
import { useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import debounce from 'lodash.debounce';
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { Card, Searchbar, Text } from "react-native-paper";
import { getBanks, startBankConnection } from "../services/api";

export default function ConnectBankScreen() {
    const [banks, setBanks] = useState<BankOption[]>([]);
    const showError = useSnackbarStore((s) => s.showError);
    const setTitle = useTitleStore((s) => s.setTitle);
    const [loading, setLoading] = useState(false);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchBanks = async (bankName: string) => {
        try {
            setLoadingBanks(true);
            const banks = await getBanks(bankName);
            setBanks(banks);
            setLoadingBanks(false);
        } catch {
            showError("Failed to load banks.");
            setLoadingBanks(false);
        }
    };

    useEffect(() => {
        fetchBanks('');
    }, []);

    const debouncedSearch = useRef(
        debounce((text: string) => {
            fetchBanks(text);
        }, 500)
    ).current;

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const onChangeSearch = (text: string) => {
        setSearchQuery(text);
        debouncedSearch(text);
    };

    async function onSelectBank(selectedBank: BankOption) {
        try {
            setLoading(true);
            const authUrl = await startBankConnection(selectedBank.name, selectedBank.country, selectedBank.logo, selectedBank.maximumConsentValidity);
            setLoading(false);
            await WebBrowser.openAuthSessionAsync(authUrl);
        } catch {
            showError("Bank connection failed.");
            setLoading(false);
        }
    }

    useFocusEffect(() => {
        setTitle("Select Bank");
    });

    return (
        <ScreenContainer scrollable={false}>
            <OverlayLoader isVisible={loadingBanks} message='Loading banks...' />
            <OverlayLoader isVisible={loading} message='Redirecting to Bank page...' />
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
                    <Card style={styles.bankCard} onPress={() => onSelectBank(item)}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={{ uri: item.logo }}
                                resizeMode="contain"
                                style={styles.bankLogo}
                            />
                        </View>
                        <Card.Content style={styles.bankContent}>
                            <Text>{item.name}</Text>
                            <Text>{item.country}</Text>
                        </Card.Content>
                    </Card>
                )}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bankCard: {
        margin: 10,
        padding: 20,
    },
    logoContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bankLogo: {
        width: 80,
        height: 50,
    },
    bankContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
});
