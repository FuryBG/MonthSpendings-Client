import { ScreenContainer } from "@/components/ScreenContainer";
import { Tavira } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Text } from "react-native-paper";

export default function ConnectBankSuccessScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.15, duration: 400, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    Animated.timing(opacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }).start();
  }, []);

  return (
    <ScreenContainer glowColor="teal">
      <View style={styles.container}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
          <View style={styles.iconGlow} />
          <View style={styles.iconCircle}>
            <Icon source="check-bold" size={40} color={Tavira.navy} />
          </View>
        </Animated.View>
        <Animated.View style={[styles.textBlock, { opacity }]}>
          <Text style={styles.title}>Bank Connected!</Text>
          <Text style={styles.subtitle}>Your bank has been successfully linked to Tavira.</Text>
        </Animated.View>
        <Animated.View style={[{ width: '100%' }, { opacity }]}>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(main)/(drawer)/(tabs)')}>
            <Text style={styles.btnText}>Continue to App</Text>
            <Icon source="arrow-right" size={18} color={Tavira.navy} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 28, paddingHorizontal: 32 },
  iconWrap: { position: 'relative', width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  iconGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(62,198,198,0.18)' },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: Tavira.teal, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(62,198,198,0.4)' },
  textBlock: { alignItems: 'center', gap: 10 },
  title: { fontSize: 26, fontWeight: '800', color: '#F2F4F8', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: 'rgba(242,244,248,0.55)', textAlign: 'center', lineHeight: 22 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Tavira.teal, paddingVertical: 16, borderRadius: 16 },
  btnText: { fontSize: 16, fontWeight: '700', color: Tavira.navy },
});
