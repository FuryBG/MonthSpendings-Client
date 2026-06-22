import { Tavira } from '@/constants/theme';
import * as React from 'react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

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
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => onHide(true)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => onHide(true)}>
          <View style={s.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[s.dialog, { backgroundColor: dialogBg }]}>
                {title && (
                  <Text style={[s.title, { color: theme.colors.onSurface }]}>
                    {title}
                  </Text>
                )}
                <ScrollView
                  style={s.scrollArea}
                  contentContainerStyle={s.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
                <View style={[s.actions, { borderTopColor: theme.colors.outlineVariant }]}>
                  <Button onPress={() => onHide(true)}>Cancel</Button>
                  <Button
                    onPress={() => onHide(false)}
                    loading={loading}
                    mode="contained"
                    buttonColor={Tavira.teal}
                    textColor={Tavira.navy}
                  >
                    Done
                  </Button>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    );
  }
);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    width: '90%',
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
});
