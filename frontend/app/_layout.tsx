import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router'; // <--- Importamos useRootNavigationState
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from '../src/context/user';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
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
  const { isLoading } = useUser();
  const { isReady, hasShareIntent, shareIntent } = useShareIntentContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isReady) {
      console.log('Ocultando splash');
      SplashScreen.hideAsync().catch(err => {
        console.warn('Error ocultando Splash:', err);
      });
    }
  }, [isLoading, isReady]);

  useEffect(() => {
    if (hasShareIntent && shareIntent.files && shareIntent.files.length > 0) {
      console.log(shareIntent.files);
      console.debug('[expo-router-index] redirect to ShareIntent screen');
      router.replace({
        pathname: '/share-intent',
        params: { sharedFilePath: shareIntent.files[0].path },
      });
    }
  }, [hasShareIntent, shareIntent]);

  if (isLoading || !isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
