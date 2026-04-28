import React from 'react';
import { SafeAreaView, Alert, View } from 'react-native';
import { Button, Layout, Text, Input, Icon, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/authService';

const BackIcon = (props) => (
  <Icon {...props} name='arrow-back'/>
);

const OtpVerificationScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onVerifyPress = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      Alert.alert('Success', 'Account verified successfully!', [
        { text: 'OK', onPress: () => router.push('/register') } // Redirect to register for now as login is out of scope
      ]);
    } catch (error) {
      Alert.alert('Verification Failed', error.message);
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
        <Text category='h1' style={styles.title} testID="otp-verification-title">Verify OTP</Text>
        <Text style={styles.subtitle}>Sent to: {email}</Text>
        <Input
          value={otp}
          placeholder='Enter OTP'
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
          {loading ? '' : 'Verify'}
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