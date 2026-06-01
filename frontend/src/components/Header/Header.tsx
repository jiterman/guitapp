import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { userService } from '../../services/userService';
import { notificationService } from '../../services/notificationService';
import styles from '../../styles/headerStyles';

const Header: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('Usuario');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [profile, count] = await Promise.all([
          userService.getProfile(),
          notificationService.getUnreadCount(),
        ]);
        if (mounted) {
          setFirstName(profile.firstName || 'Usuario');
          setUnreadCount(count);
        }
      } catch {
        // ignore errors
      }
    };

    loadData();
    // Poll for unread count every 1 minute
    const interval = setInterval(loadData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>
          Bienvenido, <Text style={styles.name}>{firstName}</Text>
        </Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;
