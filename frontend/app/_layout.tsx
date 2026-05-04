import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useSegments } from 'expo-router';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import BottomNavBar from '../src/components/BottomNavBar';
import * as SplashScreen from 'expo-splash-screen';

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
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={customTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        {segments[0] !== '(auth)' && <BottomNavBar />}
        <StatusBar style="auto" />
      </ApplicationProvider>
    </>
  );
}
