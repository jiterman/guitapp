import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, Layout, Text, Input, Icon } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

const EmailIcon = (props) => (
  <Icon {...props} name='email'/>
);

const LockIcon = (props) => (
  <Icon {...props} name='lock'/>
);

const PersonIcon = (props) => (
  <Icon {...props} name='person'/>
);

const RegistrationScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const onRegisterPress = () => {
    // Registration logic will go here
    console.log('Register Pressed', { email, password, confirmPassword });
  };

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
        />
        <Input
          value={password}
          placeholder='Password'
          onChangeText={setPassword}
          style={styles.input}
          accessoryLeft={LockIcon}
          secureTextEntry
        />
        <Input
          value={confirmPassword}
          placeholder='Confirm Password'
          onChangeText={setConfirmPassword}
          style={styles.input}
          accessoryLeft={LockIcon}
          secureTextEntry
        />
        <Button style={styles.button} onPress={onRegisterPress} testID="register-button">Register</Button>
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
});

export default RegistrationScreen;