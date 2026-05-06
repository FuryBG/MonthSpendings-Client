import { Tavira } from '@/constants/theme';
import * as React from 'react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

type ModalProps = {
  title?: string;
  loading: boolean;
  onSubmit: (cancelled: boolean) => void;
  children?: React.ReactNode;
};

export type ModalRef = {
  open: () => void;
  close: () => void;
};

export const Modal = forwardRef<ModalRef, ModalProps>(
  function Modal({ title, onSubmit, children, loading }: ModalProps, ref) {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    function onHide(cancelled: boolean) {
      if (cancelled) setVisible(false);
      onSubmit(cancelled);
    }

    const dialogBg = theme.dark ? '#0F2244' : theme.colors.surface;

    return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => onHide(true)}
          dismissable
          style={{ borderRadius: 16, backgroundColor: dialogBg }}
        >
          <Dialog.Title>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>{title}</Text>
          </Dialog.Title>
          <Dialog.Content>{children}</Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => onHide(false)} loading={loading} mode="contained" buttonColor={Tavira.teal} textColor={Tavira.navy}>
              Done
            </Button>
            <Button onPress={() => onHide(true)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
);
