import React, { useState } from 'react';
import { Alert, View, Image, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Layout, Text, Input } from '@ui-kitten/components';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { validateEmail } from '../utils/validation';
import { loginStyles as styles } from '../styles/loginStyles';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const onSendPress = async () => {
    setEmailError(null);
    const emailValidationMsg = validateEmail(email);
    if (emailValidationMsg) {
      setEmailError(emailValidationMsg);
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      router.push({ pathname: '/verify-reset-otp', params: { email } });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Ocurrió un error al procesar tu solicitud. Intentá de nuevo.');
    } finally {
      setLoading(false);
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
            Recuperar contraseña
          </Text>
          <Text category="s1" style={styles.subtitle}>
            Ingresá tu email para recibir un código de recuperación.
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
              status={emailError ? 'danger' : 'basic'}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
              testID="email-input"
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <Button
              style={styles.button}
              onPress={onSendPress}
              disabled={loading}
              testID="send-otp-button"
            >
              {() => (
                <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar código'}</Text>
              )}
            </Button>

            <Button appearance="ghost" onPress={() => router.back()} style={{ marginTop: 10 }}>
              Volver al inicio
            </Button>
          </View>
        </Layout>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
