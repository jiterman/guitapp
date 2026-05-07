import { Stack } from 'expo-router';
import { UserProvider } from '../../src/context/UserContext';

export default function AuthLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
