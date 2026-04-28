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

  const onRegisterPress = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password);
      router.push({ pathname: '/verify-otp', params: { email } });
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const LoadingIndicator = (props) => (
    <View style={[props.style, styles.indicator]}>
      <Spinner size='small'/>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container}>
        <Text category='h1' style={styles.title} testID="registration-title">Register</Text>
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
          secureTextEntry
          disabled={loading}
        />
        <Input
          value={confirmPassword}
          placeholder='Confirm Password'
          onChangeText={setConfirmPassword}
          style={styles.input}
          accessoryLeft={LockIcon}
          secureTextEntry
          disabled={loading}
        />
        <Button 
          style={styles.button} 
          onPress={onRegisterPress} 
          testID="register-button"
          disabled={loading}
          accessoryLeft={loading ? LoadingIndicator : undefined}
        >
          {loading ? '' : 'Register'}
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
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegistrationScreen;