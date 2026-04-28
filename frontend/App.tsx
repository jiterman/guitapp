import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import RegistrationScreen from './src/screens/RegistrationScreen';
import { StyleSheet, View } from 'react-native';

const customTheme = {
  ...eva.light,
  // Customizing colors based on ui-guidelines.md
  'color-primary-default': '#3498db',
  'color-primary-500': '#3498db',
  'color-info-default': '#3498db', // For Inputs focus
  'color-basic-100': '#ffffff', // Surface
  'color-basic-200': '#f4f7f6', // Background
  'color-basic-800': '#2c3e50', // Text Primary
  'color-basic-600': '#7f8c8d', // Text Secondary
  'border-radius': '8px', // General border radius
};

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack}/>
      <ApplicationProvider {...eva} theme={customTheme}>
        <RegistrationScreen />
        <StatusBar style="auto" />
      </ApplicationProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
