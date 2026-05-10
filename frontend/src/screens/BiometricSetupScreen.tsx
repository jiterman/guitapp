import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layout, Text, Button, Icon } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { userService } from '../services/userService';

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
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="shield-outline" fill="#003366" style={styles.icon} />
          </View>

          <Text category="h4" style={styles.title}>
            Acceso con biometría
          </Text>

          <Text style={styles.description}>
            ¿Querés habilitar el acceso con huella o Face ID para entrar más rápido la próxima vez?
          </Text>

          <View style={styles.buttonContainer}>
            <Button style={styles.enableButton} onPress={handleEnable}>
              Habilitar
            </Button>

            <Button appearance="ghost" status="basic" onPress={handleSkip}>
              Ahora no
            </Button>
          </View>
        </View>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 30,
    backgroundColor: '#c8dff0',
    padding: 20,
    borderRadius: 50,
  },
  icon: {
    width: 60,
    height: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#003366',
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  enableButton: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
});

export default BiometricSetupScreen;
