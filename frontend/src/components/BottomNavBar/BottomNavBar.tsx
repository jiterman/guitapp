import React, { useRef, useState, useEffect } from 'react';
import { View, Pressable, PanResponder, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import HOME_ICON from '../../../assets/icons/homeIcon';
import LIST_ICON from '../../../assets/icons/listIcon';
import CHART_ICON from '../../../assets/icons/chartIcon';
import SUMMARY_ICON from '../../../assets/icons/summaryIcon';
import PLUS_ICON from '../../../assets/icons/plusIcon';
import styles from '../../styles/bottomNavStyles';

const ROUTE_ORDER = ['/home', '/statistics', '/transactions', '/summary'];

const ACTIVE_COLOR = '#07a3e4';
const INACTIVE_COLOR = '#a8c8e0';

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const currentIndex = useRef<number>(0);
  const [currentPath, setCurrentPath] = useState('/home');

  useEffect(() => {
    const idx = ROUTE_ORDER.indexOf(pathname || '');
    if (idx !== -1) {
      currentIndex.current = idx;
      setCurrentPath(pathname || '/home');
    }
  }, [pathname]);

  const getIconColor = (path: string) => (currentPath === path ? ACTIVE_COLOR : INACTIVE_COLOR);

  const renderIcon = (xml: string, path: string) => {
    const color = getIconColor(path);
    // Replace the hardcoded color in icons with the dynamic one
    const modifiedXml = xml.replace(/#07a3e4/g, color);
    return <SvgXml xml={modifiedXml} width={24} height={24} />;
  };

  const panRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (Math.abs(dx) < 50) return;
        const idx = currentIndex.current;
        if (dx < -50 && idx < ROUTE_ORDER.length - 1) {
          const next = idx + 1;
          currentIndex.current = next;
          router.push(ROUTE_ORDER[next]);
        } else if (dx > 50 && idx > 0) {
          const prev = idx - 1;
          currentIndex.current = prev;
          router.push(ROUTE_ORDER[prev]);
        }
      },
    })
  );

  const NavButton = ({
    path,
    icon,
    label,
    index,
  }: {
    path: string;
    icon: string;
    label: string;
    index: number;
  }) => (
    <Pressable
      style={styles.button}
      onPress={() => {
        currentIndex.current = index;
        router.push(path);
      }}
      accessibilityRole="button"
    >
      <View style={currentPath === path ? styles.iconWrapper : styles.iconWrapperInactive}>
        {renderIcon(icon, path)}
      </View>
      <Text style={[styles.label, { color: getIconColor(path) }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom, height: 65 + insets.bottom }]}
      accessibilityRole="tablist"
      {...panRef.current.panHandlers}
    >
      <NavButton path="/home" icon={HOME_ICON} label="Inicio" index={0} />
      <NavButton path="/statistics" icon={CHART_ICON} label="Estadísticas" index={1} />

      <View style={styles.fabContainer}>
        <Pressable
          style={styles.fabButton}
          onPress={() => router.push('/add-movement')}
          accessibilityRole="button"
          accessibilityLabel="Agregar movimiento"
        >
          <SvgXml xml={PLUS_ICON.replace('currentColor', '#fff')} width={30} height={30} />
        </Pressable>
      </View>

      <NavButton path="/transactions" icon={LIST_ICON} label="Movimientos" index={2} />
      <NavButton path="/summary" icon={SUMMARY_ICON} label="Resumen" index={3} />
    </View>
  );
};

export default BottomNavBar;
