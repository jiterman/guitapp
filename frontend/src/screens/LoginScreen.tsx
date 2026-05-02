import React, { useState } from 'react';
import { SafeAreaView, Alert, View, TouchableOpacity, Image } from 'react-native';
import { Button, Layout, Text, Input, Icon, IconProps } from '@ui-kitten/components';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { validateEmail, validatePassword } from '../utils/validation';
import { loginStyles as styles } from '../styles/loginStyles';
import { AuthError } from '../types/errors';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onPasswordIconPress = () => {
    setPasswordVisible(!passwordVisible);
  };

  const renderPasswordIcon = (props: IconProps) => (
    <Icon
      {...props}
      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
      onPress={onPasswordIconPress}
    />
  );

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar contraseña',
      'La funcionalidad de recuperación de contraseña estará disponible pronto.'
    );
  };

  const onLoginPress = async () => {
    // Reset errors
    setEmailError(null);
    setPasswordError(null);

    // Validate
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

      // Fetch user profile to check onboarding status
      const profile = await userService.getProfile();

      if (profile.onboardingCompleted) {
        router.replace({ pathname: '/home', params: { email } });
      } else {
        router.replace('/onboarding');
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
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.forgotPasswordLink}>Recuperala tocando acá</Text>
          </TouchableOpacity>

          <Button style={styles.button} onPress={onLoginPress} disabled={loading}>
            {() => <Text style={styles.buttonText}>{loading ? 'Iniciando...' : 'Ingresar'}</Text>}
          </Button>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          style={styles.footerLinkContainer}
        >
          <Text style={styles.footerText}>
            ¿No tenés cuenta? <Text style={styles.footerLink}>Unite tocando acá</Text>
          </Text>
        </TouchableOpacity>
      </Layout>
    </SafeAreaView>
  );
};

export default LoginScreen;
