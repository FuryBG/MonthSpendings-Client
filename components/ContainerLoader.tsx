import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

type LoaderProps = {
  isVisible: boolean,
  message: string
}

export function ContainerLoader({ isVisible, message }: LoaderProps) {

  return isVisible ? (
    <View
      style={{
        position: "absolute",
        backgroundColor: 'rgba(0,0,0,0.4)',
        top:0,
        left:0,
        right:0,
        bottom:0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99
      }}
    >
      <ActivityIndicator size="large" />
      <Text variant="bodyMedium" style={{ color: 'white', marginTop: 16 }}>
        {message}
      </Text>

    </View>
  ) : null;
}
