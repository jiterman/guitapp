import React from 'react';
import { Alert, View, Image, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Layout, Text, Input, Spinner } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { loginStyles as styles } from '../styles/loginStyles';

const VerifyEmailChangeOtpScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const { user, setUser } = useUser();

  const onVerifyPress = async () => {
    setOtpError(null);
    if (!otp || otp.length !== 6) {
      setOtpError('Ingresá un código de 6 dígitos.');
      return;
    }

    setLoading(true);
    setShowLoadingPopup(true);
    try {
      await userService.verifyEmailChange(otp);

      // Email updated successfully. Now logout.
      if (user) {
        await authService.removeBiometricUser(user.email);
      }
      await authService.removeToken();
      setUser(null);

      router.replace({
        pathname: '/verification-success',
        params: {
          title: '¡Email verificado!',
          subtitle:
            'Tu correo electrónico ha sido actualizado correctamente. Por favor, iniciá sesión nuevamente con tu nuevo email.',
          securityNote: 'Por razones de seguridad, se ha desactivado el ingreso biométrico.',
        },
      });
    } catch (err: unknown) {
      let errorMessage = 'Ocurrió un error al verificar el código. Por favor, intentá nuevamente.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setShowLoadingPopup(false);
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
            Confirmar nuevo mail
          </Text>
          <Text category="s1" style={styles.otpVerificationSubtitle}>
            Enviamos un código de 6 dígitos a tu nuevo mail:
          </Text>
          <Text category="s1" style={styles.emailSubtitle}>
            {email}
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Ingresá el código</Text>
            <Input
              testID="otp-input"
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
            <Button
              testID="verify-button"
              style={styles.button}
              onPress={onVerifyPress}
              disabled={loading}
            >
              {() => (
                <Text style={styles.buttonText}>
                  {loading ? 'Verificando...' : 'Verificar y salir'}
                </Text>
              )}
            </Button>
          </View>
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
            Actualizando email...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VerifyEmailChangeOtpScreen;
