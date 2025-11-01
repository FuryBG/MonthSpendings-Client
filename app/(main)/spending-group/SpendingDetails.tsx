import { ScreenContainer } from '@/components/ScreenContainer';
import { useTitle } from '@/context/NavBarTitleContext';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import { Card, IconButton, MD2Colors, Text } from 'react-native-paper';



type DrawerParamList = {
  GroupDetails: { id: string; title: string };
};

// Props type for React Navigation Drawer screen
type Props = DrawerScreenProps<DrawerParamList, 'GroupDetails'>;


export default function SpendingDetailsScreen() {
  const route = useRoute<RouteProp<DrawerParamList, 'GroupDetails'>>();
  const { setTitle } = useTitle();
  const { id } = route.params; // ✅ id is typed as string

useFocusEffect(() => {
  setTitle(id);
});

  return (
    <ScreenContainer>
      <Card style={{ marginBottom: 12 }}>
        <Card.Title
          title="-7.50"
          subtitle="Milk and butter"

          left={(props) => <Text>21.01.2025</Text>}
          right={(props) => 
            <IconButton iconColor={MD2Colors.red800} icon="close"/>} />
      </Card>

    </ScreenContainer>
  );
}