import { ScreenContainer } from "@/components/ScreenContainer";
import { useNavigation, useRouter } from "expo-router";
import { Button, Text } from "react-native-paper";



export default function ConnectBankScreen() {
    const navigation = useNavigation();
    const router = useRouter();

    async function GoHome() {
        router.replace("/(main)/(tabs)");
    }

    return (
        <ScreenContainer scrollable={false}>
            <Text style={{ textAlign: "center" }}>Successfuly connected to you Bank!</Text>
            <Button onPress={GoHome}>Continue</Button>
        </ScreenContainer>
    );
}