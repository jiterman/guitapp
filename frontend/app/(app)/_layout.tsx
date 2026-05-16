import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Icon } from '@ui-kitten/components';
import { Stack, Redirect, useSegments } from 'expo-router';
import { useUser } from '../../src/context/UserContext';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export default function AppLayout() {
  const { user, isLoading } = useUser();
  const segments = useSegments();
  usePushNotifications();

  if (!isLoading && !user) {
    return <Redirect href="/login" />;
  }

  if (user && !user.onboardingCompleted && !segments.includes('onboarding')) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person-outline" style={styles.avatarIcon} fill="#07a3e4" />
            </View>
          )}

          <View style={styles.greetingTextContainer}>
            <Text style={styles.name}>
              Hola, <Text style={styles.nameBold}>{user?.firstName ?? 'Usuario'}</Text>
            </Text>
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
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" style={styles.notificationIcon} fill="#003366" />
        </TouchableOpacity>
      </View>

      <Stack screenOptions={{ headerShown: false }} />
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
    flex: 1,
  },
  greetingTextContainer: {
    flex: 1,
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
  },
  notificationIcon: {
    width: 24,
    height: 24,
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
