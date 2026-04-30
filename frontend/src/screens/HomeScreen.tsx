import React from 'react';
import { SafeAreaView } from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../services/authService';

const HomeScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();

  const onLogoutPress = async () => {
    await authService.removeToken();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container}>
        <Text category='h1' style={styles.title}>Bienvenido</Text>
        <Text category='h6' style={styles.email}>{email}</Text>
        <Button 
          style={styles.button} 
          status='danger' 
          onPress={onLogoutPress}
        >
          Cerrar Sesión
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
    marginBottom: 10,
    color: '#2c3e50',
  },
  email: {
    marginBottom: 40,
    color: '#34495e',
  },
  button: {
    width: '100%',
    borderRadius: 8,
  },
});

export default HomeScreen;
