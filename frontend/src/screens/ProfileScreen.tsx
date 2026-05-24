import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import PasswordSheet from '../components/Profile/PasswordSheet';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import AvatarPicker from './AvatarPicker';
import { useUser } from '../context/UserContext';
import { router } from 'expo-router';
import ProfileMenuItem from '../components/Profile/ProfileMenuItem';
import PersonalInfoSheet from '../components/Profile/PersonalInfoSheet';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;
const SHEET_HEIGHT = vh * 55;

const ProfileScreen: React.FC = () => {
  const { user, setUser, getCreatedMonth, getCreatedYear } = useUser();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const [passwordSheetVisible, setPasswordSheetVisible] = useState(false);
  const passwordTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveName = async (newFirst: string, newLast: string) => {
    if (saving || !user) return;
    setSaving(true);
    try {
      const updatedProfile = await userService.updateProfile(newFirst, newLast);
      if (user.email) {
        await authService.updateBiometricUserName(user.email, updatedProfile.firstName);
      }
      setUser({
        ...user,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        onboardingCompleted: true, // If they are here, it's completed
      });
      closeSheet();
    } catch (e) {
      console.error('Error actualizando perfil', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async (newEmail: string) => {
    if (saving || !user) return;
    setSaving(true);
    try {
      await userService.initiateEmailChange(newEmail);
      closeSheet();
      router.push({
        pathname: '/verify-email-change',
        params: { email: newEmail },
      });
    } catch (e) {
      console.error('Error iniciando cambio de email', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (currentPassword: string, newPassword: string) => {
    if (saving) return;

    setSaving(true);
    setPasswordError(null);
    try {
      await userService.initiatePasswordChange(currentPassword, newPassword);
      setConfirmVisible(true);
    } catch (e) {
      const rawMessage = e instanceof Error ? e.message : String(e);

      let message = rawMessage;

      if (rawMessage.toLowerCase().includes('network request failed')) {
        message = 'Parece que hay un problema de conexión. Intentá nuevamente más tarde.';
      }

      setPasswordError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPasswordChange = async (confirmed: boolean) => {
    setConfirmLoading(true);
    setConfirmError(null);

    try {
      await userService.confirmPasswordChange(confirmed);

      if (confirmed) {
        setPasswordSheetVisible(false);
        setConfirmError(null);

        await authService.removeToken();
        setUser(null);
        router.replace('/login');
        alert('Contraseña cambiada con éxito');
      } else {
        setConfirmVisible(false);
      }
    } catch (e) {
      if (confirmed) {
        const rawMessage = e instanceof Error ? e.message : String(e);

        let message = rawMessage;

        if (rawMessage.toLowerCase().includes('network request failed')) {
          message = 'Parece que hay un problema de conexión. Intentá nuevamente más tarde.';
        }
        setPasswordError(message);
      }
    } finally {
      setConfirmVisible(false);
      setConfirmLoading(false);
    }
  };

  const handlePasswordInputChange = () => {
    if (passwordError) setPasswordError(null);
  };

  const openSheet = () => {
    setSheetVisible(true);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  const openPasswordSheet = () => {
    setPasswordError(null);
    setSaving(false);

    setPasswordSheetVisible(true);

    Animated.spring(passwordTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const closePasswordSheet = () => {
    Animated.timing(passwordTranslateY, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setPasswordSheetVisible(false));
  };

  return (
    <>
      <Layout style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <AvatarPicker
                avatarUrl={user?.avatarUrl}
                onUploaded={(url: string) => {
                  if (user) {
                    setUser({
                      ...user,
                      avatarUrl: url,
                    });
                  }
                }}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <View style={styles.memberRow}>
                <Ionicons name="calendar-outline" size={16} color="#6b8aa1" />
                <Text style={styles.memberText}>
                  Miembro desde {getCreatedMonth()} {getCreatedYear()}
                </Text>
              </View>
            </View>
          </View>

          {/* Cuenta */}
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              title="Información personal"
              subtitle="Editá tu nombre y correo electrónico."
              icon="person-outline"
              iconColor="#07a3e4"
              iconBackground="#E6F2FC"
              onPress={openSheet}
            />
          </View>

          {/* Finanzas */}
          <Text style={styles.sectionTitle}>Finanzas</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem
              title="Estructura de gastos"
              subtitle="Editá tus gastos fijos y variables"
              icon="pie-chart-outline"
              iconColor="#FFBB00"
              iconBackground="rgba(255,187,0,0.12)"
            />
          </View>

          {/* Seguridad */}
          <Text style={styles.sectionTitle}>Seguridad</Text>

          <View style={styles.menuCard}>
            <ProfileMenuItem
              title="Contraseña"
              subtitle="Cambiá tu contraseña para proteger tu cuenta"
              icon="lock-closed-outline"
              iconColor="#FF3B30"
              iconBackground="rgba(255, 59, 48, 0.12)"
              onPress={openPasswordSheet}
            />
          </View>

          {/* Cerrar sesión */}
          <View style={styles.menuCard}>
            <ProfileMenuItem
              title="Cerrar sesión"
              icon="log-out-outline"
              iconColor="#6c757d"
              iconBackground="rgba(108, 117, 125, 0.12)"
              onPress={async () => {
                await authService.removeToken();
                setUser(null);
                router.replace('/login');
              }}
            />
          </View>
        </ScrollView>
      </Layout>

      <PersonalInfoSheet
        visible={sheetVisible}
        translateY={translateY}
        onClose={closeSheet}
        user={user}
        saving={saving}
        onSaveName={handleSaveName}
        onSaveEmail={handleSaveEmail}
      />

      <PasswordSheet
        visible={passwordSheetVisible}
        translateY={passwordTranslateY}
        onClose={closePasswordSheet}
        saving={saving}
        passwordError={passwordError}
        confirmVisible={confirmVisible}
        confirmLoading={confirmLoading}
        confirmError={confirmError}
        onSavePassword={handleSavePassword}
        onConfirmPasswordChange={handleConfirmPasswordChange}
        onPasswordInputChange={handlePasswordInputChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
  },
  scrollContent: {
    padding: screenWidth * 0.05,
    paddingTop: vh * 2,
    paddingBottom: vh * 3,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: vh * 2.5,
    padding: screenWidth * 0.05,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  memberText: {
    fontSize: 13,
    color: '#6b8aa1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: vh * 1,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: vh * 2.5,
    paddingVertical: vh * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // Bottom Sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});

export default ProfileScreen;
