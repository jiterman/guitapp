import React, { useState } from 'react';
import { SafeAreaView, Alert, View, TouchableOpacity } from 'react-native';
import { Button, Layout, Text, Input, Icon } from '@ui-kitten/components';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { validateEmail, validatePassword } from '../utils/validation';
import { loginStyles as styles } from '../styles/loginStyles';

const EmailIcon = (props: any) => <Icon {...props} name="email-outline" />;
const LockIcon = (props: any) => <Icon {...props} name="lock-outline" />;

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

  const renderPasswordIcon = (props: any) => (
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
      router.push({ pathname: '/home', params: { email } });
    } catch (error: any) {
      let errorMessage =
        'Alguno de los campos ingresados no es correcto. Verifica los datos ingresados.';
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
          <Text style={styles.iconText}>💰</Text>
        </View>

        <Text category="h1" style={styles.title}>
          Hey, ¡bienvenido de nuevo! 👋
        </Text>
        <Text category="s1" style={styles.subtitle}>
          ¿Listo para ver tus finanzas?
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Tu email</Text>
          <Input
            value={email}
            placeholder="tu@email.com"
            onChangeText={text => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            style={styles.input}
            status={emailError ? 'danger' : 'basic'}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <Text style={styles.label}>Tu contraseña (mantenla en secreto 😉)</Text>
          <Input
            value={password}
            placeholder="........"
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
          </TouchableOpacity>

          <Button style={styles.button} onPress={onLoginPress} disabled={loading}>
            {() => <Text style={styles.buttonText}>{loading ? 'Iniciando...' : '¡Vamos! 🚀'}</Text>}
          </Button>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Tus datos están seguros 🔒</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          style={styles.registerLinkContainer}
        >
          <Text style={styles.registerLinkText}>¿No tienes cuenta? Únete a nosotros ✨</Text>
        </TouchableOpacity>
      </Layout>
    </SafeAreaView>
  );
};

export default LoginScreen;
