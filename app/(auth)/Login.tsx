import { ScreenContainer } from '@/components/ScreenContainer';
import { AuthContext } from '@/context/AuthContext';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { useContext } from 'react';

export default function LoginScreen() {
  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  async function OnSignIn() {
    try {
      await GoogleSignin.configure();
      const userInfo = await GoogleSignin.signIn();
      const googleToken = userInfo.data?.user.id;
      await signIn(googleToken, userInfo.data?.user);
      router.replace("/(main)/(tabs)");
      
      // do something with userInfo
    } catch (error) {
      console.log(error);

    }
  }

  return (
    <ScreenContainer>
      <GoogleSigninButton
        onPress={OnSignIn}
      />
    </ScreenContainer>
  );
}
