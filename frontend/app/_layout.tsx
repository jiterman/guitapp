import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavBar from '../src/components/BottomNavBar';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from '../src/context/UserContext';

SplashScreen.preventAutoHideAsync();

const customTheme = {
  ...eva.light,
  'color-primary-default': '#3498db',
  'color-primary-500': '#3498db',
  'color-info-default': '#3498db',
  'color-basic-100': '#ffffff',
  'color-basic-200': '#f4f7f6',
  'color-basic-800': '#2c3e50',
  'color-basic-600': '#7f8c8d',
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const segments = useSegments();

  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={customTheme}>
        <UserProvider>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            {segments[0] !== '(auth)' && <BottomNavBar />}
          </View>
        </UserProvider>

        <StatusBar style="auto" />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
}
