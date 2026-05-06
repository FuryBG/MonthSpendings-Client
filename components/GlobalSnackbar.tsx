import { Tavira } from '@/constants/theme';
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
        style={isSuccess
          ? { backgroundColor: 'rgba(62,198,198,0.15)', borderWidth: 1, borderColor: 'rgba(62,198,198,0.3)' }
          : { backgroundColor: 'rgba(255,107,107,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.25)' }
        }
        theme={{
          colors: {
            inversePrimary: isSuccess ? Tavira.teal : Tavira.expense,
            inverseOnSurface: isSuccess ? Tavira.teal : Tavira.expense,
          },
        }}
        action={{ label: 'OK', onPress: hide }}
      >
        {message}
      </Snackbar>
    </Portal>
  );
}
