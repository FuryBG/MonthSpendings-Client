import React from "react";
import { ActivityIndicator, Modal, Portal, Text } from "react-native-paper";

type LoaderProps = {
    isVisible:boolean,
    message:string
}

export function OverlayLoader({ isVisible, message }:LoaderProps) {

  return (
   <Portal>
        <Modal
          visible={isVisible}
          dismissable={false}
          contentContainerStyle={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ color: 'white', marginTop: 16 }}>
            {message}
          </Text>
        </Modal>
      </Portal>
  );
}
