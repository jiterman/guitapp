import { useRef, useState } from 'react';
import { Animated } from 'react-native';

export const useBottomSheet = (sheetHeight: number) => {
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(sheetHeight)).current;

  const open = () => {
    setVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const close = () => {
    Animated.timing(translateY, {
      toValue: sheetHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return {
    visible,
    translateY,
    open,
    close,
  };
};
