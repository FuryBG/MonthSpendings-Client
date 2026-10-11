import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import i18n from '@/i18n';

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    // Channel id stays "default" (the API sends to it); only the visible name is localized.
    await Notifications.setNotificationChannelAsync("default", {
      name: i18n.t("notifications.channelName"),
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      throw new Error(
        "Permission not granted to get push token for push notification!"
      );
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(`${e}`);
    }
  // } else {
  //   throw new Error("Must use physical device for push notifications");
  // }
}