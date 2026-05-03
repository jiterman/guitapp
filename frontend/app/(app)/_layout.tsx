import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ui-kitten/components';
import { Stack, router } from 'expo-router';
import { authService } from '../../src/services/authService';
import { userService } from '../../src/services/userService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export default function AppLayout() {
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setFirstName(profile.firstName || 'Usuario');
      } catch {
        setFirstName('Usuario');
      }
    };
    fetchProfile();
  }, []);

  const onLogoutPress = async () => {
    await authService.removeToken();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
        </View>
        <TouchableOpacity onPress={onLogoutPress}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F2FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: vh * 1.5,
    backgroundColor: '#E6F2FC',
  },
  greeting: {
    fontSize: 16,
    color: '#006699',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 14,
  },
});
