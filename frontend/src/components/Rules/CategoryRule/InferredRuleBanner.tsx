import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

interface InferredRuleBannerProps {
  isVisible: boolean;
}

export const InferredRuleBanner: React.FC<InferredRuleBannerProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.bannerContainer}>
      <Ionicons name="information-circle-outline" size={16} color="#07a3e4" style={styles.icon} />
      <Text style={styles.bannerText}>Tipo de gasto inferido por regla existente</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4FA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d0e9f5',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  bannerText: {
    fontSize: 12,
    color: '#013366',
    fontWeight: '500',
  },
});
