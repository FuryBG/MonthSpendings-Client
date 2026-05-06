import { Tavira } from '@/constants/theme';
import { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Modal as RNModal, Platform, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
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

// Layout-only styles — no hardcoded colors so theme colors are used naturally
export const sheetStyles = StyleSheet.create({
  sheetTitle:           { fontSize: 18, fontWeight: '700', marginBottom: 8, letterSpacing: -0.3 },
  sheetInput:           { width: '100%' },
  sheetActions:         { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  sheetConfirmContent:  { paddingHorizontal: 8 },
  sheetCenteredContent: { alignItems: 'center', paddingVertical: 8 },
  sheetConfirmIcon:     { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  sheetConfirmTitle:    { fontSize: 17, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sheetConfirmDesc:     { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 20, opacity: 0.6 },
});

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet({ visible, onClose, children, panelStyle }, ref) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const isDark = theme.dark;

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
        Animated.spring(sheetTranslateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 280, mass: 0.8 }),
      ]).start();
    }, [visible]);

    function animateClose(onDone?: () => void) {
      if (isClosing) return;
      setIsClosing(true);
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 400, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setIsClosing(false);
        onClose(onDone);
      });
    }

    useImperativeHandle(ref, () => ({ close: animateClose }));

    const panelBg = isDark ? 'rgba(10,22,50,0.97)' : theme.colors.surface;
    const borderColor = isDark ? Tavira.glassBorder : theme.colors.outlineVariant;
    const dragPillColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)';

    return (
      <RNModal visible={visible} transparent animationType="none" onRequestClose={() => animateClose()}>
        <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => animateClose()} />
        </Animated.View>
        <KeyboardAvoidingView style={s.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Animated.View style={[
            s.panel,
            { backgroundColor: panelBg, borderColor, paddingBottom: insets.bottom + 24 },
            panelStyle,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}>
            <TouchableOpacity style={s.dragArea} onPress={() => animateClose()} activeOpacity={1}>
              <Animated.View style={[s.dragPill, { backgroundColor: dragPillColor }]} />
            </TouchableOpacity>
            {isClosing ? frozenChildrenRef.current : children}
          </Animated.View>
        </KeyboardAvoidingView>
      </RNModal>
    );
  }
);

const s = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
    paddingTop: 0,
    gap: 8,
  },
  dragArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
