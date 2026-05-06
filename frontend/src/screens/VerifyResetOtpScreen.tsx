import React, { useState } from 'react';
import { Alert, View, Image, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Layout, Text, Input, Spinner } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/authService';
import { loginStyles as styles } from '../styles/loginStyles';
import { AuthError } from '../types/errors';

const VerifyResetOtpScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const onVerifyPress = async () => {
    setOtpError(null);
    if (!otp || otp.length !== 6) {
      setOtpError('Ingresá un código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyResetOtp(email, otp);
      router.push({ pathname: '/reset-password', params: { email, otp } });
    } catch (err) {
      const error = err as AuthError;
      let errorMessage = 'El código ingresado es inválido o ha expirado.';

      if (error.code === 'OTP_EXPIRED') {
        errorMessage = 'El código ha expirado. Por favor, solicita uno nuevo.';
      } else if (error.code === 'INVALID_OTP') {
        errorMessage = 'El código ingresado es incorrecto.';
      }

      Alert.alert('Error de verificación', errorMessage);
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
            Verifica el código
          </Text>
          <Text category="s1" style={styles.otpVerificationSubtitle}>
            Enviamos un código de 6 dígitos a:
          </Text>
          <Text category="s1" style={styles.emailSubtitle}>
            {email}
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Ingresá el código</Text>
            <Input
              value={otp}
              placeholder="123456"
              onChangeText={text => {
                setOtp(text);
                if (otpError) setOtpError(null);
              }}
              style={styles.input}
              textStyle={styles.inputText}
              keyboardType="number-pad"
              maxLength={6}
              disabled={loading}
              status={otpError ? 'danger' : 'basic'}
            />
            {otpError && <Text style={styles.errorText}>{otpError}</Text>}
            <Button style={styles.button} onPress={onVerifyPress} disabled={loading}>
              {() => (
                <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Verificar'}</Text>
              )}
            </Button>
          </View>
        </Layout>
      </KeyboardAvoidingView>

      {loading && (
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
            Verificando código...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VerifyResetOtpScreen;
