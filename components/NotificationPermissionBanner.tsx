import { Tavira } from '@/constants/theme';
import RNAndroidNotificationListener from 'react-native-android-notification-listener';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

type Props = {
  onDismiss?: () => void;
};

export function NotificationPermissionBanner({ onDismiss }: Props) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View style={[s.banner, {
      backgroundColor: isDark ? 'rgba(62,198,198,0.10)' : 'rgba(11,27,58,0.05)',
      borderColor: isDark ? 'rgba(62,198,198,0.25)' : 'rgba(11,27,58,0.12)',
    }]}>
      <View style={[s.iconWrap, { backgroundColor: isDark ? 'rgba(62,198,198,0.15)' : theme.colors.surfaceVariant }]}>
        <Icon source="bell-badge-outline" size={20} color={isDark ? Tavira.teal : theme.colors.primary} />
      </View>
      <View style={s.textBlock}>
        <Text style={[s.title, { color: isDark ? '#F2F4F8' : Tavira.navy }]}>
          Enable Notification Access
        </Text>
        <Text style={[s.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Required to capture wallet spending notifications automatically.
        </Text>
      </View>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: Tavira.teal }]}
        onPress={() => RNAndroidNotificationListener.requestPermission()}
      >
        <Text style={s.btnText}>Grant</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexShrink: 0,
  },
  btnText: {
    color: Tavira.navy,
    fontWeight: '700',
    fontSize: 13,
  },
});
