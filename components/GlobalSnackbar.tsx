import { Tavira } from '@/constants/theme';
import { useSnackbarStore } from '@/stores/snackbarStore';
import React from 'react';
import { Portal, Snackbar } from 'react-native-paper';
import i18n from '@/i18n';

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
          ? { backgroundColor: '#0D3D3D', borderWidth: 1, borderColor: Tavira.teal }
          : { backgroundColor: '#3D0D0D', borderWidth: 1, borderColor: Tavira.expense }
        }
        theme={{
          colors: {
            inversePrimary: isSuccess ? Tavira.teal : Tavira.expense,
            inverseOnSurface: isSuccess ? Tavira.teal : Tavira.expense,
          },
        }}
        action={{ label: i18n.t('common.actions.ok'), onPress: hide }}
      >
        {message}
      </Snackbar>
    </Portal>
  );
}
