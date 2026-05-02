import React from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Layout, Text } from '@ui-kitten/components';
import { router } from 'expo-router';
import { loginStyles as styles } from '../styles/loginStyles';

const VerificationSuccessScreen = () => {
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

        <Text category="h1" style={styles.title} testID="success-title">
          ¡Cuenta verificada existosamente!
        </Text>
        <Text category="s1" style={styles.subtitle} testID="success-subtitle">
          Tocá el botón Ingresar para ir a la pantalla de Inicio de Sesión.
        </Text>
        <Button style={styles.button} onPress={() => router.push('/login')} testID="login-button">
          {() => <Text style={styles.buttonText}>Ingresar</Text>}
        </Button>
      </Layout>
    </SafeAreaView>
  );
};

export default VerificationSuccessScreen;
