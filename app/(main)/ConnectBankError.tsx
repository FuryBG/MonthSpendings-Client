import { ScreenContainer } from "@/components/ScreenContainer";
import { Tavira } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "react-native-paper";

export default function ConnectBankErrorScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 350, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    Animated.timing(opacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }).start();
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
          <View style={styles.iconGlow} />
          <View style={styles.iconCircle}>
            <Icon source="close-thick" size={40} color="#FFFFFF" />
          </View>
        </Animated.View>
        <Animated.View style={[styles.textBlock, { opacity }]}>
          <Text style={styles.title}>Connection Failed</Text>
          <Text style={styles.subtitle}>Something went wrong connecting your bank.{'\n'}Please try again later.</Text>
        </Animated.View>
        <Animated.View style={[{ width: '100%' }, { opacity }]}>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(main)/(drawer)/(tabs)')}>
            <Text style={styles.btnText}>Back to App</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 28, paddingHorizontal: 32 },
  iconWrap: { position: 'relative', width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  iconGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,107,107,0.14)' },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: Tavira.expense, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,107,107,0.4)' },
  textBlock: { alignItems: 'center', gap: 10 },
  title: { fontSize: 26, fontWeight: '800', color: '#F2F4F8', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: 'rgba(242,244,248,0.55)', textAlign: 'center', lineHeight: 22 },
  btn: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,107,107,0.15)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)', paddingVertical: 16, borderRadius: 16 },
  btnText: { fontSize: 16, fontWeight: '700', color: Tavira.expense },
});
