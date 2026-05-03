import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../../services/userService';
import styles from '../../styles/headerStyles';

const Header: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('Usuario');
  

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await userService.getProfile();
        if (mounted) setFirstName(profile.firstName || 'Usuario');
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>
          Bienvenido, <Text style={styles.name}>{firstName}</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Header;
