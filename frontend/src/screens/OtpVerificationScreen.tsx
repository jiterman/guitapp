import React from 'react';
import { SafeAreaView } from 'react-native';
import { Button, Layout, Text, Input, Icon } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

const BackIcon = (props) => (
  <Icon {...props} name='arrow-back'/>
);

const OtpVerificationScreen = ({ navigation }) => {
  const [otp, setOtp] = React.useState('');

  const onVerifyPress = () => {
    // OTP verification logic will go here
    console.log('Verify OTP Pressed', { otp });
    // On success, navigate to a placeholder login screen or home
    // navigation.navigate('Login'); 
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container}>
        <Text category='h1' style={styles.title} testID="otp-verification-title">Verify OTP</Text>
        <Input
          value={otp}
          placeholder='Enter OTP'
          onChangeText={setOtp}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          testID="otp-input"
        />
        <Button style={styles.button} onPress={onVerifyPress} testID="verify-otp-button">Verify</Button>
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

export default OtpVerificationScreen;