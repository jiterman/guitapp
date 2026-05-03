import React from 'react';
import { Alert, View, Image, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Layout, Text, Input, Icon, Spinner, IconProps } from '@ui-kitten/components';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { loginStyles as styles } from '../styles/loginStyles';
import { AuthError } from '../types/errors';

const RegistrationScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = React.useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = React.useState<string | null>(null);

  const onPasswordIconPress = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setPasswordVisible(!passwordVisible);
    } else {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  const renderPasswordIcon = (props: IconProps, field: 'password' | 'confirmPassword') => (
    <Icon
      {...props}
      name={
        (field === 'password' ? passwordVisible : confirmPasswordVisible)
          ? 'eye-off-outline'
          : 'eye-outline'
      }
      onPress={() => onPasswordIconPress(field)}
    />
  );

  const onRegisterPress = async () => {
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!email) {
      setEmailError('El email es requerido.');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Ingresá un email válido.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('La contraseña es requerida.');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirmá tu contraseña.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    setShowLoadingPopup(true); // Show loading popup
    try {
      const response = await authService.register(email, password);
      if (response && response.code === 'OTP_RESENT') {
        // Check for code instead of message string
        Alert.alert(
          'OTP Reenviado',
          'El usuario ya existe y estaba pendiente de verificación. Se ha enviado un nuevo código OTP a tu email.',
          [
            {
              text: 'OK',
              onPress: () => router.push({ pathname: '/verify-otp', params: { email } }),
            },
          ]
        );
      } else if (response && response.code === 'REGISTRATION_SUCCESS') {
        router.push({ pathname: '/verify-otp', params: { email } });
      } else {
        // Fallback for unexpected successful response structures
        Alert.alert(
          'Registro Exitoso',
          'Tu cuenta ha sido registrada. Por favor, verifica tu email para el código OTP.',
          [
            {
              text: 'OK',
              onPress: () => router.push({ pathname: '/verify-otp', params: { email } }),
            },
          ]
        );
      }
    } catch (err) {
      const error = err as AuthError;
      let errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      const errorTitle = 'Error de Registro';

      // Check for backend error codes
      if (error.code) {
        switch (error.code) {
          case 'MAIL_ALREADY_USED':
            errorMessage = 'El email ya se encuentra en uso.';
            break;
          case 'VALIDATION_FAILED':
            // For validation failures, the backend message might contain specific field errors
            errorMessage = error.message || errorMessage;
            break;
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage =
              'Has excedido el límite de intentos. Por favor, espera un momento antes de volver a intentar.';
            break;
          // Add other specific error codes as needed
          default:
            errorMessage = `Error: ${error.code}. Por favor, inténtalo de nuevo.`;
            break;
        }
        // Check for common network-related error messages from the fetch API
        // This is a heuristic approach and might need refinement based on actual error objects from React Native's fetch implementation.
      } else if (
        error.message &&
        (error.message.includes('Network request failed') ||
          error.message.includes('Failed to fetch'))
      ) {
        errorMessage =
          'Ocurrió un error al intentar conectarse con el servicio. Puede que el servicio esté temporalmente fuera de servicio o haya un problema con tu conexión a internet.';
      } else if (error.message) {
        // For other errors coming from authService (e.g., server-side validation messages without a specific code)
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
      setShowLoadingPopup(false); // Hide loading popup
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

          <Text category="h1" style={styles.title} testID="registration-title">
            Unite a Guitapp
          </Text>
          <Text category="s1" style={styles.subtitle}>
            ¡Crea tu cuenta hoy!
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Input
              value={email}
              placeholder="tu@email.com"
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              style={styles.input}
              textStyle={styles.inputText}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
              status={emailError ? 'danger' : 'basic'}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <Text style={styles.label}>Contraseña</Text>
            <Input
              value={password}
              placeholder="********"
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              style={styles.input}
              textStyle={styles.inputText}
              secureTextEntry={!passwordVisible}
              disabled={loading}
              status={passwordError ? 'danger' : 'basic'}
              accessoryRight={props => renderPasswordIcon(props, 'password')}
            />
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <Text style={styles.label}>Confirmar Contraseña</Text>
            <Input
              value={confirmPassword}
              placeholder="********"
              onChangeText={text => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError(null);
              }}
              style={styles.input}
              textStyle={styles.inputText}
              secureTextEntry={!confirmPasswordVisible}
              disabled={loading}
              status={confirmPasswordError ? 'danger' : 'basic'}
              accessoryRight={props => renderPasswordIcon(props, 'confirmPassword')}
            />
            {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}

            <Button
              style={styles.button}
              onPress={onRegisterPress}
              testID="register-button"
              disabled={loading}
            >
              {() => (
                <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
              )}
            </Button>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={styles.footerLinkContainer}
          >
            <Text style={styles.footerText}>
              ¿Ya tenés cuenta? <Text style={styles.footerLink}>Ingresá</Text>
            </Text>
          </TouchableOpacity>
        </Layout>
      </KeyboardAvoidingView>

      {showLoadingPopup && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <Spinner size="giant" />
          <Text category="h6" style={{ marginTop: 15, color: '#ffffff' }}>
            Generando usuario...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RegistrationScreen;
