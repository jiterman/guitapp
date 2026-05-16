import React, { useRef, useState, useEffect } from 'react';
import { View, Pressable, PanResponder } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import HOME_ICON from '../../../assets/icons/homeIcon';
import LIST_ICON from '../../../assets/icons/listIcon';
import CHART_ICON from '../../../assets/icons/chartIcon';
import PERSON_ICON from '../../../assets/icons/personIcon';
import styles from '../../styles/bottomNavStyles';

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const order = ['/home', '/statistics', '/transactions', '/profile'];
  const currentIndex = useRef<number>(0);
  const [currentPath, setCurrentPath] = useState('/home');

  useEffect(() => {
    const idx = order.indexOf(pathname || '');
    if (idx !== -1) {
      currentIndex.current = idx;
      setCurrentPath(pathname || '/home');
    }
  }, [pathname]);

  const panRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
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
    <View
      style={[styles.container, { paddingBottom: insets.bottom }]}
      accessibilityRole="tablist"
      {...panRef.current.panHandlers}
    >
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 0;
          router.push('/home');
        }}
        accessibilityRole="button"
      >
        <View style={currentPath === '/home' ? styles.iconWrapper : styles.iconWrapperInactive}>
          <SvgXml xml={HOME_ICON} width={24} height={24} />
        </View>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 1;
          router.push('/statistics');
        }}
        accessibilityRole="button"
      >
        <View
          style={currentPath === '/statistics' ? styles.iconWrapper : styles.iconWrapperInactive}
        >
          <SvgXml xml={CHART_ICON} width={24} height={24} />
        </View>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 2;
          router.push('/transactions');
        }}
        accessibilityRole="button"
      >
        <View
          style={currentPath === '/transactions' ? styles.iconWrapper : styles.iconWrapperInactive}
        >
          <SvgXml xml={LIST_ICON} width={24} height={24} />
        </View>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          currentIndex.current = 3;
          router.push('/profile');
        }}
        accessibilityRole="button"
      >
        <View style={currentPath === '/profile' ? styles.iconWrapper : styles.iconWrapperInactive}>
          <SvgXml xml={PERSON_ICON} width={24} height={24} />
        </View>
      </Pressable>
    </View>
  );
};

export default BottomNavBar;
