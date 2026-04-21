import { OverlayLoader } from '@/components/OverlayLoader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuthStore } from '@/stores/authStore';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Portal, Snackbar, Text } from 'react-native-paper';
import { googleLogin } from '../services/api';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [visible, setVisible] = useState(false);
  const [signing, setSigning] = useState(false);

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
    } catch {
      setVisible(true);
      setSigning(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Month Spendings</Text>
        <GoogleSigninButton style={styles.signInButton} onPress={OnSignIn} />
      </View>
      <OverlayLoader isVisible={signing} message='Sign in...' />
      <Portal>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={5000}
          action={{
            label: 'OK',
            onPress: () => setVisible(false),
          }}>
          Google login failed. Please try again.
        </Snackbar>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  signInButton: {
    alignSelf: 'center',
  },
});
