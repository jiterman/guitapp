import React from 'react';
import { SafeAreaView, Alert, View, Image, TouchableOpacity } from 'react-native';
import { Button, Layout, Text, Input, Spinner } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/authService';
import { loginStyles as styles } from '../styles/loginStyles';

const OtpVerificationScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = React.useState(false);

  const onVerifyPress = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error de verificación', 'Por favor, ingresa un código de 6 dígitos.');
      return;
    }

    setLoading(true);
    setShowLoadingPopup(true);
    try {
      await authService.verifyOtp(email, otp);
      router.push('/verification-success');
    } catch (error: any) {
      // Cast to any to access error.code
      let errorMessage =
        'Ocurrió un error inesperado durante la verificación. Por favor, inténtalo de nuevo.';
      const errorTitle = 'Verificación Fallida';

      if (error.code) {
        switch (error.code) {
          case 'INVALID_OTP':
            errorMessage = 'El código ingresado es inválido.';
            break;
          case 'OTP_EXPIRED':
            errorMessage = 'El código ha expirado. Por favor, solicita uno nuevo.';
            break;
          case 'USER_NOT_FOUND':
            errorMessage = 'Usuario no encontrado. Por favor, verifica el email.';
            break;
          case 'USER_ALREADY_VERIFIED':
            errorMessage = 'Este usuario ya ha sido verificado.';
            break;
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage =
              'Has excedido el límite de intentos. Por favor, espera un momento antes de volver a intentar.';
            break;
          default:
            errorMessage = `Error: ${error.code}. Por favor, inténtalo de nuevo.`;
            break;
        }
      } else if (
        error.message &&
        (error.message.includes('Network request failed') ||
          error.message.includes('Failed to fetch'))
      ) {
        errorMessage =
          'Ocurrió un error de conexión. Por favor, verifica tu internet o intenta de nuevo más tarde.';
      } else if (error.message) {
        errorMessage = error.message; // Fallback to generic message if no code or network error
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
      setShowLoadingPopup(false);
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

        <Text category="h1" style={styles.title} testID="otp-verification-title">
          Verificación de mail
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
            onChangeText={setOtp}
            style={styles.input}
            textStyle={styles.inputText}
            keyboardType="number-pad"
            maxLength={6}
            testID="otp-input"
            disabled={loading}
          />
          <Button
            style={styles.button}
            onPress={onVerifyPress}
            testID="verify-otp-button"
            disabled={loading}
          >
            {() => (
              <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Verificar'}</Text>
            )}
          </Button>
        </View>
      </Layout>

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
            Verificando cuenta...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;
