import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layout, Text, Button, Spinner } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const HomeScreen = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setFirstName(profile.firstName || 'Usuario');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setFirstName('Usuario');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onLogoutPress = async () => {
    await authService.removeToken();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Spinner size="giant" />
          </View>
        ) : (
          <>
            <Text category="h1" style={styles.title}>
              Bienvenido,
            </Text>
            <Text category="h2" style={styles.name}>
              {firstName}
            </Text>
            <Button style={styles.button} status="danger" onPress={onLogoutPress}>
              Cerrar Sesión
            </Button>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 5,
    color: '#2c3e50',
  },
  name: {
    marginBottom: 40,
    color: '#3498db',
  },
  button: {
    width: '100%',
    borderRadius: 8,
  },
});

export default HomeScreen;
