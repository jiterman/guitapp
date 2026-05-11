import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Layout, Text, Input, Icon, IconProps } from '@ui-kitten/components';
import { router } from 'expo-router';
import { authService, BiometricUser } from '../services/authService';
import { userService } from '../services/userService';
import { validateEmail, validatePassword } from '../utils/validation';
import { loginStyles as styles } from '../styles/loginStyles';
import { AuthError } from '../types/errors';
import { useUser } from '../context/UserContext';

const LoginScreen = () => {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricUsers, setBiometricUsers] = useState<BiometricUser[]>([]);
  const [userSelectorVisible, setUserSelectorVisible] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await authService.isBiometricAvailable();
      if (!available) return;
      const users = await authService.getBiometricUsers();
      setBiometricAvailable(users.length > 0);
      setBiometricUsers(users);
    };
    checkBiometric();
  }, []);

  const loginAsUser = async (user: BiometricUser) => {
    setUserSelectorVisible(false);
    const credentials = await authService.getBiometricCredentials(user.email);
    if (!credentials) return;
    setLoading(true);
    try {
      await authService.login(credentials.email, credentials.password);
      const profile = await userService.getProfile();
      setUser(profile);
      if (profile.onboardingCompleted) {
        router.replace({ pathname: '/home', params: { email: credentials.email } });
      } else {
        router.replace('/onboarding');
      }
    } catch {
      Alert.alert('Error', 'No se pudo ingresar. Intentá con usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const onBiometricButtonPress = async () => {
    const authenticated = await authService.authenticateWithBiometrics();
    if (!authenticated) return;
    if (biometricUsers.length === 1) {
      loginAsUser(biometricUsers[0]);
    } else {
      setUserSelectorVisible(true);
    }
  };

  const onPasswordIconPress = () => setPasswordVisible(!passwordVisible);

  const renderPasswordIcon = (props: IconProps) => (
    <Icon
      {...props}
      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
      onPress={onPasswordIconPress}
    />
  );

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const onLoginPress = async () => {
    setEmailError(null);
    setPasswordError(null);

    const emailValidationMsg = validateEmail(email);
    const passwordValidationMsg = validatePassword(password);
    if (emailValidationMsg || passwordValidationMsg) {
      if (emailValidationMsg) setEmailError(emailValidationMsg);
      if (passwordValidationMsg) setPasswordError(passwordValidationMsg);
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);

      const profile = await userService.getProfile();

      const biometricHardwareAvailable = await authService.isBiometricAvailable();
      const existingUsers = await authService.getBiometricUsers();
      const alreadyEnabled = existingUsers.some(u => u.email === email);

      if (biometricHardwareAvailable && !alreadyEnabled) {
        authService.setTempPassword(password);
        router.replace({
          pathname: '/biometric-setup',
          params: {
            email,
            firstName: profile.firstName,
            onboardingCompleted: profile.onboardingCompleted.toString(),
          },
        });
      } else {
        setUser(profile);
        navigateAfterLogin(profile, email);
      }
    } catch (err) {
      const error = err as AuthError;
      let errorMessage =
        'Alguno de los campos ingresados no es correcto. Verificá los datos ingresados.';
      if (
        error.message &&
        (error.message.includes('Network request failed') ||
          error.message.includes('Failed to fetch'))
      ) {
        errorMessage = 'Error de conexión con el servidor.';
      } else if (error.message && error.message !== 'Login failed') {
        errorMessage = error.message;
      }
      Alert.alert('Error de Inicio de Sesión', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateAfterLogin = (profile: { onboardingCompleted: boolean }, userEmail: string) => {
    if (profile.onboardingCompleted) {
      router.replace({ pathname: '/home', params: { email: userEmail } });
    } else {
      router.replace('/onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
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
            ¡Hola, bienvenido!
          </Text>
          <Text category="s1" style={styles.subtitle}>
            ¿Listo para ver tus finanzas?
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Ingresá tu email</Text>
            <Input
              value={email}
              placeholder="tu@email.com"
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              style={styles.input}
              textStyle={styles.inputText}
              status={emailError ? 'danger' : 'basic'}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <Text style={styles.label}>Ingresá tu contraseña</Text>
            <Input
              value={password}
              placeholder="********"
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              style={styles.input}
              status={passwordError ? 'danger' : 'basic'}
              secureTextEntry={!passwordVisible}
              disabled={loading}
              accessoryRight={renderPasswordIcon}
            />
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordLink}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Button style={styles.button} onPress={onLoginPress} disabled={loading}>
              {() => <Text style={styles.buttonText}>{loading ? 'Iniciando...' : 'Ingresar'}</Text>}
            </Button>

            {biometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={onBiometricButtonPress}
                disabled={loading}
              >
                <Text style={styles.biometricText}>🔐 Ingresar con biometría</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={styles.footerLinkContainer}
          >
            <Text style={styles.footerText}>
              ¿No tenés cuenta? <Text style={styles.footerLink}>Unite</Text>
            </Text>
          </TouchableOpacity>
        </Layout>
      </KeyboardAvoidingView>

      <Modal
        visible={userSelectorVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setUserSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>¿Con quién ingresás?</Text>
              <TouchableOpacity onPress={() => setUserSelectorVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={biometricUsers}
              keyExtractor={item => item.email}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.userItem} onPress={() => loginAsUser(item)}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {item.firstName
                        ? item.firstName[0].toUpperCase()
                        : item.email[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    {item.firstName && <Text style={styles.userName}>{item.firstName}</Text>}
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginScreen;
