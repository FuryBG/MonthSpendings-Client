import { OverlayLoader } from '@/components/OverlayLoader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuthStore } from '@/stores/authStore';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Portal, Snackbar, Text, useTheme } from 'react-native-paper';
import { googleLogin } from '../services/api';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [visible, setVisible] = useState(false);
  const [signing, setSigning] = useState(false);
  const theme = useTheme();

  async function OnSignIn() {
    try {
      await GoogleSignin.configure();
      const userInfo = await GoogleSignin.signIn();
      const googleToken = userInfo.data?.user.id;

      if (googleToken != undefined) {
        setSigning(true);
        let jwt = await googleLogin({ id: userInfo.data!.user.id, notificationToken: "", email: userInfo.data!.user.email, familyName: userInfo.data!.user.familyName, givenName: userInfo.data!.user.givenName, photo: userInfo.data!.user.photo });
        await signIn(jwt);
        setSigning(false);
      }
    } catch(e) {
      console.log(e);
      
      setVisible(true);
      setSigning(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.branding}>
        <Icon source="cash-fast" size={72} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.primary }]}>Month Spendings</Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Your money, clarified.
        </Text>
      </View>
      <View style={styles.actions}>
        <GoogleSigninButton style={styles.signInButton} onPress={OnSignIn} />
      </View>
      <OverlayLoader isVisible={signing} message='Sign in...' />
      <Portal>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={5000}
          action={{ label: 'OK', onPress: () => setVisible(false) }}>
          Google login failed. Please try again.
        </Snackbar>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  branding: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    opacity: 0.6,
    textAlign: 'center',
  },
  actions: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  signInButton: {
    alignSelf: 'center',
  },
});
