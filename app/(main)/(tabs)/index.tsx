import { Modal, ModalRef } from '@/components/Modal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useTitle } from '@/context/NavBarTitleContext';
import { useNotification } from '@/context/NotificationContext';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { Avatar, Card, IconButton, MD2Colors, TextInput } from 'react-native-paper';

export default function HomeScreen() {
  const { notification, expoPushToken, error } = useNotification();
  const router = useRouter();
  const { setTitle } = useTitle();
  const modalRef = useRef<ModalRef>(null);

  useFocusEffect(() => {
    setTitle("Home");
  });

  return (
    <>
      <ScreenContainer>
        {/* <Text>Updates Demo 1</Text>
        <Text style={{ color: "red" }}>
          Your push token:
        </Text>
        <Text>{expoPushToken}</Text>
        <Text>Latest notification:</Text>
        <Text>{notification?.request.content.title}</Text>
        <Text>
          {JSON.stringify(notification?.request.content.data, null, 2)}
        </Text> */}
        <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "1" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>

        <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "2" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
        <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "3" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
        <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "4" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
        <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "5" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
        <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "6" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
        <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "7" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
                <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "8" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
                <Card style={{ marginBottom: 12 }} onPress={() => router.push({ pathname: "/spending-group/SpendingDetails", params: { id: "9" } })}>
          <Card.Title
            title="Food"
            subtitle="Money Left: 200"
            left={(props) => <Avatar.Icon {...props} icon="folder" />}
            right={(props) => <View style={{ flexDirection: "row" }}>
              <IconButton icon="minus" iconColor={MD2Colors.red800} onPress={() => modalRef.current?.open()} />
              <IconButton icon="plus" iconColor={MD2Colors.green400} onPress={() => modalRef.current?.open()} />
            </View>} />
        </Card>
      </ScreenContainer>
      {/* <FloatingButton iconName='plus'></FloatingButton> */}
      <Modal ref={modalRef} onClose={(cancelled: boolean) => console.log(cancelled)} title='Food'>
        <TextInput style={{ marginBottom: 20 }}
          label="Name"
        />
        <TextInput
          label="Budget"
          keyboardType='numeric'
        />
      </Modal>
    </>
  );
}