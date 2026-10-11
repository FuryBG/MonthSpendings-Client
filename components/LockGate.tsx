import { authenticate } from '@/app/services/biometrics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export function LockGate({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(0.93)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start();
    tryAuth();
  }, []);

  async function tryAuth() {
    setShowRetry(false);
    const success = await authenticate(t('lock.prompt'));
    if (success) {
      onUnlock();
    } else {
      triggerShake();
      setShowRetry(true);
    }
  }

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }

  return (
    <View style={styles.overlay}>
      <Text style={styles.wordmark}>T A V I R A</Text>

      <Pressable onPress={tryAuth}>
        <Animated.View style={[styles.halo, { transform: [{ scale }, { translateX: shake }] }]}>
          <Icon source="fingerprint" size={32} color="#3EC6C6" />
        </Animated.View>
      </Pressable>

      <Text style={styles.hint}>{t('lock.hint')}</Text>

      {showRetry && (
        <Pressable onPress={tryAuth} style={styles.retryBtn}>
          <Text style={styles.retryText}>{t('common.actions.tryAgain')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0B1B3A',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 72,
    gap: 24,
  },
  wordmark: {
    position: 'absolute',
    top: 72,
    color: '#3EC6C6',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 8,
  },
  halo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(62,198,198,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    color: 'rgba(242,244,248,0.45)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  retryText: {
    color: '#3EC6C6',
    fontSize: 15,
    fontWeight: '500',
  },
});
