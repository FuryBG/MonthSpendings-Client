import { ScreenContainer } from "@/components/ScreenContainer";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native-paper";

export default function ConnectSaltEdgeSuccessScreen() {
    const router = useRouter();

    function GoHome() {
        router.replace("/(main)/(drawer)/(tabs)");
    }

    return (
        <ScreenContainer scrollable={false}>
            <Text style={{ textAlign: "center" }}>Successfully connected your bank with Salt Edge!</Text>
            <Button onPress={GoHome}>Continue</Button>
        </ScreenContainer>
    );
}
