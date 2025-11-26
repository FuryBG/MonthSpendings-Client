import * as React from 'react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';


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
  ({ title, onSubmit, children, loading }: ModalProps, ref) => {
    const [visible, setVisible] = useState(false);
    const containerStyle = { borderRadius: 10 };

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    function onHide(cancelled: boolean) {
      if (cancelled) {
        setVisible(false);
      }
      
      onSubmit(cancelled);
    }

    return (
      <Portal>
        <Dialog visible={visible} onDismiss={() => onHide(true)} dismissable style={containerStyle}>
          <Dialog.Title style={{ padding: 0, margin: 0 }}>
            <Text style={{ fontSize: 18 }}>{title}</Text>
          </Dialog.Title>
          <Dialog.Content>{children}</Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => onHide(false)} loading={loading} mode="contained">Done</Button>
            <Button onPress={() => onHide(true)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
);