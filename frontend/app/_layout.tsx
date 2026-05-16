import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useSegments, useRouter } from 'expo-router';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavBar from '../src/components/BottomNavBar';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider, useUser } from '../src/context/UserContext';
import { ShareIntentProvider, useShareIntent } from 'expo-share-intent';

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

function ShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error('Share Intent Error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (hasShareIntent && shareIntent.type === 'image' && !isLoading && user) {
      const imageUri = shareIntent.files?.[0]?.path;
      if (imageUri) {
        router.push({
          pathname: '/(app)/add-expense',
          params: { imageUri },
        });
        resetShareIntent();
      }
    }
  }, [hasShareIntent, shareIntent, user, isLoading, router, resetShareIntent]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const segments = useSegments();

  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={customTheme}>
        <ShareIntentProvider>
          <UserProvider>
            <View style={{ flex: 1 }}>
              <ShareIntentHandler />
              <Stack screenOptions={{ headerShown: false }} />
              {segments[0] !== '(auth)' && <BottomNavBar />}
            </View>
          </UserProvider>
        </ShareIntentProvider>

        <StatusBar style="auto" />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
}
