import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

const PasswordEditor: React.FC = () => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={[styles.menuIconCircle, { backgroundColor: '#E6F2FC' }]}>
      <Ionicons name="lock-closed-outline" size={22} color="#07a3e4" />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuLabel}>Contraseña</Text>
      <Text style={styles.menuSub}>Cambiá tu contraseña para mantener tu cuenta segura.</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#07a3e4" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
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

export default PasswordEditor;
