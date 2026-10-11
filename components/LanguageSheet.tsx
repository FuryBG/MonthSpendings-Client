import { BottomSheet, BottomSheetRef, sheetStyles } from '@/components/BottomSheet';
import { Tavira } from '@/constants/theme';
import { AppLanguage, LANGUAGE_NATIVE_NAMES, SUPPORTED_LANGUAGES } from '@/i18n';
import { useLanguageStore } from '@/stores/languageStore';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

type Props = {
  visible: boolean;
  onClose: () => void;
  onChanged?: (language: AppLanguage) => void;
};

/** Bottom sheet listing the supported app languages, each in its own script. */
export function LanguageSheet({ visible, onClose, onChanged }: Props) {
  const theme = useTheme();
  const isDark = theme.dark;
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheetRef>(null);
  const language = useLanguageStore((s) => s.language);
  const isManual = useLanguageStore((s) => s.isManual);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const muted = isDark ? 'rgba(242,244,248,0.45)' : theme.colors.onSurfaceVariant;

  const select = (next: AppLanguage) => {
    // close() animates out, then calls our onClose prop and finally this callback.
    sheetRef.current?.close(() => {
      if (next !== language) {
        setLanguage(next).then(() => onChanged?.(next));
      }
    });
  };

  return (
    <BottomSheet ref={sheetRef} visible={visible} onClose={(done) => { onClose(); done?.(); }}>
      <Text style={sheetStyles.sheetTitle}>{t('settings.language.sheetTitle')}</Text>
      {!isManual && (
        <Text style={[styles.hint, { color: muted }]}>{t('settings.language.followingPhone')}</Text>
      )}
      <View style={styles.list}>
        {SUPPORTED_LANGUAGES.map((code) => {
          const isSelected = code === language;
          const localizedName = t(`settings.language.names.${code}`);
          const nativeName = LANGUAGE_NATIVE_NAMES[code];
          return (
            <TouchableOpacity
              key={code}
              style={[styles.row, isSelected && { backgroundColor: theme.colors.secondaryContainer }]}
              onPress={() => select(code)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.badge, { backgroundColor: isSelected ? Tavira.teal : theme.colors.surfaceVariant }]}>
                <Text style={[styles.badgeText, { color: isSelected ? Tavira.navy : theme.colors.onSurface }]}>
                  {code.toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.nativeName, { color: theme.colors.onSurface }]}>{nativeName}</Text>
                {localizedName !== nativeName && (
                  <Text style={[styles.localizedName, { color: muted }]}>{localizedName}</Text>
                )}
              </View>
              {isSelected && <Icon source="check" size={18} color={isDark ? Tavira.teal : theme.colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  list: { gap: 4, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badge: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  info: { flex: 1, gap: 1 },
  nativeName: { fontSize: 15, fontWeight: '600' },
  localizedName: { fontSize: 12 },
});
