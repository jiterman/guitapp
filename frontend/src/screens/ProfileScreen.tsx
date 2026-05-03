import React from 'react';
import { Layout, Button } from '@ui-kitten/components';
import { authService } from '../services/authService';
import { router } from 'expo-router';

const ProfileScreen: React.FC = () => {
  const onLogout = async () => {
    await authService.removeToken();
    router.replace('/login');
  };

  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button status="danger" onPress={onLogout}>
        Cerrar Sesión
      </Button>
    </Layout>
  );
};

export default ProfileScreen;
