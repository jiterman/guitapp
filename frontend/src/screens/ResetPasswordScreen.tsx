import React, { useState } from 'react';
import { Alert, View, Image, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Layout, Text, Input, Icon, IconProps } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/authService';
import { validatePassword } from '../utils/validation';
import { loginStyles as styles } from '../styles/loginStyles';

const ResetPasswordScreen = () => {
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const onPasswordIconPress = () => setPasswordVisible(!passwordVisible);

  const renderPasswordIcon = (props: IconProps) => (
    <Icon
      {...props}
      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
      onPress={onPasswordIconPress}
    />
  );

  const onResetPress = async () => {
    setPasswordError(null);
    setConfirmPasswordError(null);

    const passwordValidationMsg = validatePassword(password);
    if (passwordValidationMsg) {
      setPasswordError(passwordValidationMsg);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, otp, password);
      router.push({
        pathname: '/verification-success',
        params: {
          title: '¡Contraseña restablecida!',
          subtitle:
            'Tu contraseña ha sido restablecida correctamente. Iniciá sesión con tu nueva contraseña.',
        },
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo restablecer la contraseña. Intentá de nuevo.');
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
            Nueva contraseña
          </Text>
          <Text category="s1" style={styles.subtitle}>
            Ingresá tu nueva contraseña para acceder a GuitApp.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Nueva contraseña</Text>
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

            <Text style={styles.label}>Confirmar contraseña</Text>
            <Input
              value={confirmPassword}
              placeholder="********"
              onChangeText={text => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError(null);
              }}
              style={styles.input}
              status={confirmPasswordError ? 'danger' : 'basic'}
              secureTextEntry={!passwordVisible}
              disabled={loading}
            />
            {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}

            <Button style={styles.button} onPress={onResetPress} disabled={loading}>
              {() => (
                <Text style={styles.buttonText}>
                  {loading ? 'Restableciendo...' : 'Cambiar contraseña'}
                </Text>
              )}
            </Button>
          </View>
        </Layout>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
