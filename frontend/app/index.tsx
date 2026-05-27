import { Redirect } from 'expo-router';
import { useUser } from '../src/context/user';

// Si llegamos al index es porque el user ya fue cargado (puede ser null pero ya se buscó la data en el storage)
// También está garantizado que isReady de ShareIntent es true.
export default function Index() {
  const { user } = useUser();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href={user.onboardingCompleted ? '/home' : '/onboarding'} />;
}
