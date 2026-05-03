import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Icon } from '@ui-kitten/components';
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
        <View style={styles.greetingRow}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.name}>
            Hola, <Text style={styles.nameBold}>{firstName}</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={onLogoutPress} style={styles.logoutButton}>
          <Icon name="log-out-outline" style={styles.logoutIcon} fill="#003366" />
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
    backgroundColor: '#c8dff0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: vh * 1.5,
    paddingTop: vh * 2,
    backgroundColor: '#c8dff0',
    borderBottomWidth: 1,
    borderBottomColor: '#a8c8e0',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  name: {
    fontSize: 18,
    fontWeight: '400',
    color: '#003366',
  },
  nameBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#FFBB00',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutIcon: {
    width: 20,
    height: 20,
  },
  logoutText: {
    color: '#003366',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
