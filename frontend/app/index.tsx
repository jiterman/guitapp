import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUser } from '../src/context/UserContext';

export default function Index() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  if (user) {
    return <Redirect href={user.onboardingCompleted ? '/home' : '/onboarding'} />;
  }

  return <Redirect href="/login" />;
}
