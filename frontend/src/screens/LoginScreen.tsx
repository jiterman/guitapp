import React from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { Button, Layout, Text, Input, Icon } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../services/authService';

const EmailIcon = (props: any) => (
  <Icon {...props} name='email'/>
);

const LockIcon = (props: any) => (
  <Icon {...props} name='lock'/>
);

const LoginScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const onPasswordIconPress = () => {
    setPasswordVisible(!passwordVisible);
  };

  const renderPasswordIcon = (props: any) => (
    <Icon
      {...props}
      name={passwordVisible ? 'eye-off' : 'eye'}
      onPress={onPasswordIconPress}
    />
  );

  const onLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Error de Inicio de Sesión', 'Por favor, completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error de Inicio de Sesión', 'Por favor, introduce un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      // Pass email as param to home screen
      router.push({ pathname: '/home', params: { email } }); 
    } catch (error: any) {
      let errorMessage = 'Email o contraseña incorrectos.';
      if (error.message && (error.message.includes('Network request failed') || error.message.includes('Failed to fetch'))) {
        errorMessage = 'Error de conexión con el servidor.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error de Inicio de Sesión', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container}>
        <Text category='h1' style={styles.title}>Iniciar Sesión</Text>
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
          placeholder='Contraseña'
          onChangeText={setPassword}
          style={styles.input}
          accessoryLeft={LockIcon}
          secureTextEntry={!passwordVisible}
          disabled={loading}
          accessoryRight={renderPasswordIcon}
        />
        <Button 
          style={styles.button} 
          onPress={onLoginPress} 
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Ingresar'}
        </Button>
        <Button
          appearance='ghost'
          status='basic'
          onPress={() => router.push('/register')}
          style={styles.registerLink}
        >
          ¿No tienes cuenta? Regístrate
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
    backgroundColor: '#f4f7f6',
  },
  title: {
    marginBottom: 30,
    color: '#2c3e50',
  },
  input: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  button: {
    width: '100%',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  registerLink: {
    marginTop: 20,
  }
});

export default LoginScreen;
