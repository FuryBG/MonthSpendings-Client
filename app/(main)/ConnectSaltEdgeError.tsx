import { ScreenContainer } from "@/components/ScreenContainer";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native-paper";

export default function ConnectSaltEdgeErrorScreen() {
    const router = useRouter();

    function GoHome() {
        router.replace("/(main)/(drawer)/(tabs)");
    }

    return (
        <ScreenContainer scrollable={false}>
            <Text>Something got wrong during Salt Edge bank connection. Try again later.</Text>
            <Button onPress={GoHome}>Continue</Button>
        </ScreenContainer>
    );
}
