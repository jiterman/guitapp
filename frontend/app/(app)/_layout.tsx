import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Icon } from '@ui-kitten/components';
import { Stack, useRouter } from 'expo-router';
import { useUser } from '../../src/context/user';
import BottomNavBar from '../../src/components/BottomNavBar';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';
import { notificationService } from '../../src/services/notificationService';
import { useEffect, useState, useCallback } from 'react';
import { eventEmitter } from '../../src/utils/eventEmitter';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const vh = screenHeight / 100;

export default function AppLayout() {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const router = useRouter();

  // Treat a missing channel (existing users) as PUSH; only EMAIL disables push.
  usePushNotifications(!!user && user.notificationChannel !== 'EMAIL');

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 60000);

      // Listen for push notifications and server-side notification changes (e.g. daily/weekly digest)
      const unsubscribe = eventEmitter.on('notificationReceived', () => {
        loadUnreadCount();
      });
      const unsubscribeUpdated = eventEmitter.on('notificationsUpdated', () => {
        loadUnreadCount();
      });

      // Listen for when notifications are marked as read in other screens
      const unsubscribeRead = eventEmitter.on('notificationsRead', () => {
        loadUnreadCount();
      });

      // Navigate when user taps a push notification
      const unsubscribeTap = eventEmitter.on(
        'notificationTapped',
        ({ alertType }: { alertType: string }) => {
          if (alertType === 'MONTHLY_SUMMARY') {
            router.push({ pathname: '/summary', params: { tab: 'monthly' } });
          } else if (alertType === 'CATEGORY_OVERSPENDING') {
            router.push({ pathname: '/statistics', params: { chart: 'categories' } });
          } else if (
            alertType === 'SAVINGS_GOAL_AT_RISK' ||
            alertType === 'FIXED_EXPENSE_THRESHOLD_EXCEEDED' ||
            alertType === 'VARIABLE_EXPENSE_THRESHOLD_EXCEEDED' ||
            alertType === 'NEGATIVE_BALANCE_RISK'
          ) {
            router.push({ pathname: '/statistics', params: { chart: 'fixed-variable' } });
          }
        }
      );

      return () => {
        clearInterval(interval);
        unsubscribe();
        unsubscribeUpdated();
        unsubscribeRead();
        unsubscribeTap();
      };
    }
  }, [user, loadUnreadCount]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.greetingRow}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person-outline" style={styles.avatarIcon} fill="#07a3e4" />
            </View>
          )}

          <View style={styles.greetingTextContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                Hola, <Text style={styles.nameBold}>{user?.firstName ?? 'Usuario'}</Text>
              </Text>
              <Icon name="chevron-right-outline" style={styles.chevronIcon} fill="#6b8aa1" />
            </View>
            <View style={styles.dateRow}>
              <Icon name="calendar-outline" style={styles.dateIcon} fill="#6b8aa1" />
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Icon name="bell-outline" style={styles.notificationIcon} fill="#003366" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Stack screenOptions={{ headerShown: false }} />
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#c8dff0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: vh * 1.5,
    paddingTop: vh * 2,
    backgroundColor: '#c8dff0',
    borderBottomWidth: 1,
    borderBottomColor: '#a8c8e0',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingTextContainer: {
    marginRight: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#07a3e4',
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E6F2FC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#07a3e4',
  },
  avatarIcon: {
    width: 23,
    height: 23,
  },
  name: {
    fontSize: 18,
    fontWeight: '400',
    color: '#003366',
  },
  nameBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateIcon: {
    width: 14,
    height: 14,
  },
  dateText: {
    fontSize: 13,
    color: '#6b8aa1',
  },
  chevronIcon: {
    width: 22,
    height: 22,
    marginLeft: 0,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFBB00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#e74c3c',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#FFBB00',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutIcon: {
    width: 20,
    height: 20,
  },
  logoutText: {
    color: '#003366',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
