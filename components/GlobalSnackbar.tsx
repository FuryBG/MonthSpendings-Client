import { useSnackbarStore } from '@/stores/snackbarStore';
import React from 'react';
import { Portal, Snackbar } from 'react-native-paper';

export function GlobalSnackbar() {
  const { visible, message, hide } = useSnackbarStore();

  return (
    <Portal>
      <Snackbar
        visible={visible}
        onDismiss={hide}
        duration={5000}
        action={{ label: 'OK', onPress: hide }}>
        {message}
      </Snackbar>
    </Portal>
  );
}
