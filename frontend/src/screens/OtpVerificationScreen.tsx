import React from 'react';
import { SafeAreaView, Alert, View } from 'react-native';
import { Button, Layout, Text, Input, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/authService';

const OtpVerificationScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onVerifyPress = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error de verificación', 'Por favor, ingresa un código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      Alert.alert('Éxito', '¡Cuenta verificada exitosamente!', [
        { text: 'OK', onPress: () => router.push('/login') }
      ]);
    } catch (error: any) { // Cast to any to access error.code
      let errorMessage = 'Ocurrió un error inesperado durante la verificación. Por favor, inténtalo de nuevo.';
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
          default:
            errorMessage = `Error: ${error.code}. Por favor, inténtalo de nuevo.`;
            break;
        }
      } else if (error.message && (error.message.includes('Network request failed') || error.message.includes('Failed to fetch'))) {
        errorMessage = 'Ocurrió un error de conexión. Por favor, verifica tu internet o intenta de nuevo más tarde.';
      } else if (error.message) {
        errorMessage = error.message; // Fallback to generic message if no code or network error
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const LoadingIndicator = (props: any) => (
    <View style={[props.style, styles.indicator]}>
      <Spinner size='small'/>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container}>
        <Text category='h1' style={styles.title} testID="otp-verification-title">Verificar Mail</Text>
        <Text style={styles.subtitle}>Ingresa el código de 6 dígitos enviado a:</Text>
        <Text style={styles.subtitle}>{email}</Text>
        <Input
          value={otp}
          placeholder='Ingresa el código'
          onChangeText={setOtp}
          style={styles.input}
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
          accessoryLeft={loading ? LoadingIndicator : undefined}
        >
          {loading ? '' : 'Verificar'}
        </Button>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f7f6', // Background color from guidelines
  },
  title: {
    marginBottom: 10,
    color: '#2c3e50', // Text Primary color
  },
  subtitle: {
    marginBottom: 30,
    color: '#7f8c8d', // Text Secondary color
  },
  input: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#bdc3c7', // Input border color
    backgroundColor: '#ffffff', // Surface color
  },
  button: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#3498db', // Primary color
    borderColor: '#3498db', // Primary color
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OtpVerificationScreen;