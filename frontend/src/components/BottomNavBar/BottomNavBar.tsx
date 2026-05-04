import React, { useRef } from 'react';
import { View, Pressable, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';

import HOME_ICON from '../../../assets/icons/homeIcon';
import LIST_ICON from '../../../assets/icons/listIcon';
import PERSON_ICON from '../../../assets/icons/personIcon';
import MORE_ICON from '../../../assets/icons/moreIcon';
import styles from '../../styles/bottomNavStyles';

const BottomNavBar: React.FC = () => {
  const router = useRouter();

  const order = ['/home', '/transactions', '/more', '/profile'];
  const currentIndex = useRef<number>(0);
  // try to initialize from router.pathname if available
  try {
    const pathname = (router as any).pathname;
    const idx = order.indexOf(pathname);
    if (idx !== -1) currentIndex.current = idx;
  } catch (_) {}

  const panRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (Math.abs(dx) < 50) return;
        const idx = currentIndex.current;
        if (dx < -50 && idx < order.length - 1) {
          const next = idx + 1;
          currentIndex.current = next;
          router.push(order[next]);
        } else if (dx > 50 && idx > 0) {
          const prev = idx - 1;
          currentIndex.current = prev;
          router.push(order[prev]);
        }
      },
    })
  );

  return (
    <View style={styles.container} accessibilityRole="tablist" {...panRef.current.panHandlers}>
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 0;
          router.push('/home');
        }}
        accessibilityRole="button"
      >
        <SvgXml xml={HOME_ICON} width={24} height={24} />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 1;
          router.push('/transactions');
        }}
        accessibilityRole="button"
      >
        <SvgXml xml={LIST_ICON} width={24} height={24} />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 2;
          router.push('/more');
        }}
        accessibilityRole="button"
      >
        <SvgXml xml={MORE_ICON} width={24} height={24} />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 3;
          router.push('/profile');
        }}
        accessibilityRole="button"
      >
        <SvgXml xml={PERSON_ICON} width={24} height={24} />
      </Pressable>
    </View>
  );
};

export default BottomNavBar;
