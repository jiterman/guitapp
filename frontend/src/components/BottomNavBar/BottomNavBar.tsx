import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';

import HOME_ICON from '../../../assets/icons/homeIcon';
import LIST_ICON from '../../../assets/icons/listIcon';
import PERSON_ICON from '../../../assets/icons/personIcon';
import MORE_ICON from '../../../assets/icons/moreIcon';
import styles from '../../styles/bottomNavStyles';

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  return (
    <View style={styles.container} accessibilityRole="tablist">
      <Pressable
        style={styles.button}
        onPress={() => router.push('/home')}
        accessibilityRole="button"
      >
        <SvgXml xml={HOME_ICON} width={24} height={24} />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/transactions')}
        accessibilityRole="button"
      >
        <SvgXml xml={LIST_ICON} width={24} height={24} />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/more')}
        accessibilityRole="button"
      >
        <SvgXml xml={MORE_ICON} width={24} height={24} />
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/profile')}
        accessibilityRole="button"
      >
        <SvgXml xml={PERSON_ICON} width={24} height={24} />
      </Pressable>
    </View>
  );
};

export default BottomNavBar;
