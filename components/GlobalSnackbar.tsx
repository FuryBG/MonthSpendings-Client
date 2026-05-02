import { useSnackbarStore } from '@/stores/snackbarStore';
import React from 'react';
import { Portal, Snackbar } from 'react-native-paper';

export function GlobalSnackbar() {
  const { visible, message, type, hide } = useSnackbarStore();

  const isSuccess = type === 'success';

  return (
    <Portal>
      <Snackbar
        visible={visible}
        onDismiss={hide}
        duration={5000}
        style={isSuccess ? { backgroundColor: '#3a6b00' } : undefined}
        theme={isSuccess ? { colors: { inversePrimary: '#ffffff', inverseOnSurface: '#ffffff' } } : undefined}
        action={{ label: 'OK', onPress: hide }}>
        {message}
      </Snackbar>
    </Portal>
  );
}
