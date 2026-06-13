import { Tavira } from '@/constants/theme';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

type LoaderProps = {
  isVisible: boolean;
  message: string;
};

export function OverlayLoader({ isVisible, message }: LoaderProps) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modal}>
        <View style={styles.card}>
          <ActivityIndicator size={36} color={Tavira.teal} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(7,18,40,0.75)',
  },
  card: {
    backgroundColor: 'rgba(15,34,68,0.97)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Tavira.glassBorder,
    minWidth: 180,
  },
  message: {
    color: 'rgba(242,244,248,0.8)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
