import { Stack, Redirect, useSegments } from 'expo-router';
import { useUser } from '../../src/context/UserContext';

export default function AuthLayout() {
  const { user, isLoading } = useUser();
  const segments = useSegments();

  if (!isLoading && user) {
    if (segments.includes('biometric-setup')) {
      return <Stack screenOptions={{ headerShown: false }} />;
    }
    if (user.onboardingCompleted) {
      return <Redirect href="/home" />;
    } else if (!segments.includes('onboarding')) {
      return <Redirect href="/onboarding" />;
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
