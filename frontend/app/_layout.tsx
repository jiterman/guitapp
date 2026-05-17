import React, { useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { router, Stack, useSegments } from 'expo-router'; // <--- Importamos useRootNavigationState
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from '../src/context/user';
import { ShareIntentProvider, useShareIntent } from 'expo-share-intent';
import { useUser } from '../src/context/user';

SplashScreen.preventAutoHideAsync().catch(err => {
  console.warn('Error previniendo auth hide:', err);
});

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
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={customTheme}>
        <ShareIntentProvider>
          <UserProvider>
            <RootLayoutNav />
          </UserProvider>
        </ShareIntentProvider>
        <StatusBar style="auto" />
      </ApplicationProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { isLoading, user } = useUser();
  const { isReady, hasShareIntent, shareIntent } = useShareIntent();
  const isColdStart = useRef(true);

  useEffect(() => {
    if (!isLoading && isReady) {
      SplashScreen.hideAsync().catch(err => {
        console.warn('Error ocultando Splash:', err);
      });
    }
  }, [isLoading, isReady]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        isColdStart.current = false;
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isLoading || !isReady || !user) return;

    if (hasShareIntent && shareIntent.type === 'media' && shareIntent.files?.[0]) {
      const filePath = shareIntent.files[0].path;
      console.log(
        `[Layout] Intent detectado. Path: ${filePath}. ColdStart: ${isColdStart.current}`
      );

      if (isColdStart.current) {
        // Seteamos la base Home
        router.replace('/(app)/home');

        // Enviamos el parámetro 'sharedFilePath' explícitamente a la pantalla
        router.push({
          pathname: '/(app)/share-intent',
          params: { sharedFilePath: filePath },
        });
        isColdStart.current = false;
      } else {
        router.push({
          pathname: '/(app)/share-intent',
          params: { sharedFilePath: filePath },
        });
      }
    }
  }, [hasShareIntent, shareIntent, isLoading, isReady, user]);

  if (isLoading || !isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
