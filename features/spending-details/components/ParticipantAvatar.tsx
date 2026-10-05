import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { initials } from '../model/participants';

type Props = {
  name: string;
  photoUrl: string | null;
  color: string;
  size?: number;
};

/** Google photo when available, otherwise initials; ringed in the person's colour. */
export function ParticipantAvatar({ name, photoUrl, color, size = 36 }: Props) {
  const [failed, setFailed] = useState(false);
  const inner = size - 4;

  return (
    <View style={[s.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      {photoUrl && !failed ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[s.fallback, { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: `${color}2E` }]}>
          <Text style={[s.initials, { color, fontSize: inner * 0.38 }]}>{initials(name)}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  ring: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});
