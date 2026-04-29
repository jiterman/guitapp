import React from 'react';
import { SafeAreaView, Alert, View } from 'react-native';
import { Button, Layout, Text, Input, Icon, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../services/authService';

const EmailIcon = (props) => (
  <Icon {...props} name='email'/>
);

const LockIcon = (props) => (
  <Icon {...props} name='lock'/>
);

const RegistrationScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = React.useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = React.useState(false);

  const onPasswordIconPress = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setPasswordVisible(!passwordVisible);
    } else {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  const renderPasswordIcon = (props, field: 'password' | 'confirmPassword') => (
    <Icon
      {...props}
      name={ (field === 'password' ? passwordVisible : confirmPasswordVisible) ? 'eye-off' : 'eye'}
      onPress={() => onPasswordIconPress(field)}
    />
  );

  const onRegisterPress = async () => {
    // New: Client-side validation for empty fields
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error de Registro', 'Por favor, completa todos los campos.');
      return;
    }

    // New: Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error de Registro', 'Por favor, introduce un correo electrónico válido.');
      return;
    }

    // New: Password length validation
    if (password.length < 8) {
      Alert.alert('Error de Registro', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error de Contraseña', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setShowLoadingPopup(true); // Show loading popup
    try {
      const response = await authService.register(email, password);
      if (response && response.code === "OTP_RESENT") { // Check for code instead of message string
        Alert.alert(
          'OTP Reenviado',
          'El usuario ya existe y estaba pendiente de verificación. Se ha enviado un nuevo código OTP a tu email.',
          [
            { text: 'OK', onPress: () => router.push({ pathname: '/verify-otp', params: { email } }) }
          ]
        );
      } else if (response && response.code === "REGISTRATION_SUCCESS") {
        router.push({ pathname: '/verify-otp', params: { email } });
      } else {
        // Fallback for unexpected successful response structures
        Alert.alert(
          'Registro Exitoso',
          'Tu cuenta ha sido registrada. Por favor, verifica tu email para el código OTP.',
          [
            { text: 'OK', onPress: () => router.push({ pathname: '/verify-otp', params: { email } }) }
          ]
        );
      }
    } catch (error: any) { // Using 'any' for now to easily access error.message and error.code
      let errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'; // Default Spanish error message
      const errorTitle = 'Error de Registro';

      // Check for backend error codes
      if (error.code) {
        switch (error.code) {
          case 'MAIL_ALREADY_USED':
            errorMessage = 'El email ya se encuentra en uso.';
            break;
          case 'VALIDATION_FAILED':
            // For validation failures, the backend message might contain specific field errors
            errorMessage = error.message; 
            break;
          // Add other specific error codes as needed
          default:
            errorMessage = `Error: ${error.code}. Por favor, inténtalo de nuevo.`;
            break;
        }
      // Check for common network-related error messages from the fetch API
      // This is a heuristic approach and might need refinement based on actual error objects from React Native's fetch implementation.
      } else if (error.message && (error.message.includes('Network request failed') || error.message.includes('Failed to fetch'))) {
        errorMessage = 'Ocurrió un error al intentar conectarse con el servicio. Puede que el servicio esté temporalmente fuera de servicio o haya un problema con tu conexión a internet.';
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
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container}>
        <Text category='h1' style={styles.title} testID="registration-title">Registro</Text>
        <Input
          value={email}
          placeholder='Email'
          onChangeText={setEmail}
          style={styles.input}
          accessoryLeft={EmailIcon}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
        />
        <Input
          value={password}
          placeholder='Password'
          onChangeText={setPassword}
          style={styles.input}
          accessoryLeft={LockIcon}
          secureTextEntry={!passwordVisible}
          disabled={loading}
          accessoryRight={props => renderPasswordIcon(props, 'password')}
        />
        <Input
          value={confirmPassword}
          placeholder='Confirm Password'
          onChangeText={setConfirmPassword}
          style={styles.input}
          accessoryLeft={LockIcon}
          secureTextEntry={!confirmPasswordVisible}
          disabled={loading}
          accessoryRight={props => renderPasswordIcon(props, 'confirmPassword')}
        />
        <Button 
          style={styles.button} 
          onPress={onRegisterPress} 
          testID="register-button"
          disabled={loading}
        >
          Registrarse
        </Button>
      </Layout>

      {showLoadingPopup && (
        <View style={styles.loadingOverlay}>
          <Spinner size='giant'/>
          <Text category='h6' style={styles.loadingText}>Generando usuario...</Text>
        </View>
      )}
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
    marginBottom: 30,
    color: '#2c3e50', // Text Primary color
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 15,
    color: '#ffffff',
  },
});

export default RegistrationScreen;