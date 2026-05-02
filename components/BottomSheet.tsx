import { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Modal as RNModal, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomSheetRef = {
  close: (onDone?: () => void) => void;
};

type BottomSheetProps = {
  visible: boolean;
  onClose: (onDone?: () => void) => void;
  children: ReactNode;
  panelStyle?: ViewStyle;
};

export const sheetStyles = StyleSheet.create({
  sheetTitle:           { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  sheetInput:           { width: '100%' },
  sheetActions:         { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  sheetConfirmContent:  { paddingHorizontal: 8 },
  sheetCenteredContent: { alignItems: 'center', paddingVertical: 8 },
  sheetConfirmIcon:     { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  sheetConfirmTitle:    { fontSize: 17, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sheetConfirmDesc:     { fontSize: 13, opacity: 0.6, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
});

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet({ visible, onClose, children, panelStyle }, ref) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(400)).current;
    const [isClosing, setIsClosing] = useState(false);
    const frozenChildrenRef = useRef<ReactNode>(children);

    if (!isClosing) {
      frozenChildrenRef.current = children;
    }

    useEffect(() => {
      if (!visible) return;
      setIsClosing(false);
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(400);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }, [visible]);

    function animateClose(onDone?: () => void) {
      if (isClosing) return;
      setIsClosing(true);
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setIsClosing(false);
        onClose(onDone);
      });
    }

    useImperativeHandle(ref, () => ({ close: animateClose }));

    return (
      <RNModal visible={visible} transparent animationType="none" onRequestClose={() => animateClose()}>
        <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => animateClose()} />
        </Animated.View>
        <KeyboardAvoidingView style={s.wrapper} behavior="padding">
          <Animated.View style={[
            s.panel,
            { backgroundColor: theme.colors.surface },
            { paddingBottom: insets.bottom + 20 },
            panelStyle,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}>
            {isClosing ? frozenChildrenRef.current : children}
          </Animated.View>
        </KeyboardAvoidingView>
      </RNModal>
    );
  }
);

const s = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)' },
  wrapper:  { flex: 1, justifyContent: 'flex-end' },
  panel:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 8 },
});
