import { OverlayLoader } from '@/components/OverlayLoader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthContext } from '@/context/AuthContext';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useContext, useState } from 'react';
import { View } from 'react-native';
import { Portal, Snackbar, Text } from 'react-native-paper';
import { googleLogin } from '../services/api';

export default function LoginScreen() {
  // const { notification, expoPushToken, error } = useNotification();
  const { signIn } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const [signing, setSigning] = useState(false);

  async function OnSignIn() {
    try {
      await GoogleSignin.configure();
      const userInfo = await GoogleSignin.signIn();
      const googleToken = userInfo.data?.user.id;

      if (googleToken != undefined) {
        setSigning((prev) => true);
        let jwt = await googleLogin({ id: userInfo.data!.user.id, notificationToken: "", email: userInfo.data!.user.email, familyName: userInfo.data!.user.familyName, givenName: userInfo.data!.user.givenName, photo: userInfo.data!.user.photo });
        signIn(jwt, userInfo.data?.user);
      }
    } catch (error) {
      setVisible(true);
      setSigning(false);
      console.log(error);
    }
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text variant="titleLarge" style={{ textAlign: "center" }}>Month Spendings</Text>
        <GoogleSigninButton style={{ alignSelf: "center" }} onPress={OnSignIn} />
      </View>
      <OverlayLoader isVisible={signing} message='Sign in...'></OverlayLoader>
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
