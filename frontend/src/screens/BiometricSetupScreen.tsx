import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layout, Text, Button } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { userService } from '../services/userService';
import { loginStyles as styles } from '../styles/loginStyles';

const BiometricSetupScreen = () => {
  const { setUser } = useUser();
  const { email, firstName, onboardingCompleted } = useLocalSearchParams<{
    email: string;
    firstName: string;
    onboardingCompleted: string;
  }>();

  const handleEnable = async () => {
    const password = authService.getTempPassword();
    if (password && email) {
      await authService.addBiometricUser(email, password, firstName);
    }
    authService.clearTempPassword();
    await completeLogin();
  };

  const handleSkip = async () => {
    authService.clearTempPassword();
    await completeLogin();
  };

  const completeLogin = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (e) {
      console.error('Error fetching profile after biometric setup', e);
    }

    if (onboardingCompleted === 'true') {
      router.replace({ pathname: '/home', params: { email } });
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Layout style={styles.container}>
        <View style={styles.iconContainer}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../assets/images/logotipo_transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text category="h1" style={styles.title}>
          Acceso biométrico
        </Text>
        <Text category="s1" style={styles.subtitle}>
          ¡Entrá más rápido!
        </Text>

        <View style={styles.card}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="finger-print" size={80} color="#003366" />
          </View>

          <Text style={styles.hint}>
            ¿Querés habilitar el acceso con huella o Face ID para entrar más rápido la próxima vez?
          </Text>

          <Button style={styles.button} onPress={handleEnable}>
            {() => <Text style={styles.buttonText}>Habilitar</Text>}
          </Button>

          <TouchableOpacity onPress={handleSkip} style={styles.biometricButton}>
            <Text style={styles.biometricText}>Ahora no</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    </SafeAreaView>
  );
};

export default BiometricSetupScreen;
