import React from 'react';
import { Stack } from 'expo-router';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';

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
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={customTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="register" />
          <Stack.Screen name="verify-otp" />
          <Stack.Screen name="onboarding" />
        </Stack>
        <StatusBar style="auto" />
      </ApplicationProvider>
    </>
  );
}
