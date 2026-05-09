import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { AppNotification, AppNotificationType } from "@/types/Types";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { EventSubscription } from "expo-modules-core";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        shouldShowList: true,
      }),
    });

    registerForPushNotificationsAsync()
      .then((token) => {
        console.log(token);
        if (token) setExpoPushToken(token);
      })
      .catch((err) => {
        setError(err);
      });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (receivedNotification) => {
        setNotification(receivedNotification);

        const appNotification = receivedNotification.request.content.data as AppNotification;

        switch (appNotification.type) {
          case AppNotificationType.ReceivedInvite:
            useAuthStore.getState().restoreSession();
            break;
          case AppNotificationType.SpendingAdd:
          case AppNotificationType.SpendingDelete:
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            break;
        }
      }
    );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        // handle notification response here (e.g., navigate based on response)
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const value = useMemo(
    () => ({ expoPushToken, notification, error }),
    [expoPushToken, notification, error]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
