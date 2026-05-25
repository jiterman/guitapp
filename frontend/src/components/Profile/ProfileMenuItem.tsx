import React from 'react';
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

type Props = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress?: () => void;
};

const ProfileMenuItem: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconCircle, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{title}</Text>

        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={20} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: vh * 1.5,
    gap: 12,
  },

  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuText: {
    flex: 1,
    gap: 2,
  },

  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
  },

  menuSub: {
    fontSize: 13,
    color: '#6b8aa1',
  },
});

export default ProfileMenuItem;
