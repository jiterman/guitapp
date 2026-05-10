import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import PersonalInfoEditor from './PersonalInfoEditor';
import { userService } from '../services/userService';
import AvatarPicker from './AvatarPicker';
import { useUser } from '../context/UserContext';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;
const SHEET_HEIGHT = vh * 55;

const ProfileScreen: React.FC = () => {
  const { user, setUser } = useUser();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const handleSaveName = async (newFirst: string, newLast: string) => {
    if (saving || !user) return;
    setSaving(true);
    try {
      const updatedProfile = await userService.updateProfile(newFirst, newLast);
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

  return (
    <>
      <Layout style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
                <Text style={styles.memberText}>Miembro desde abril 2025</Text>
              </View>
            </View>
          </View>

          {/* Cuenta */}
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={openSheet}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#E6F2FC' }]}>
                <Ionicons name="person-outline" size={22} color="#07a3e4" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Información personal</Text>
                <Text style={styles.menuSub}>Editá tu nombre y correo electrónico.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#07a3e4" />
            </TouchableOpacity>
          </View>

          {/* Finanzas */}
          <Text style={styles.sectionTitle}>Finanzas</Text>
          <View style={styles.menuCard}>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(255,187,0,0.12)' }]}>
                <Ionicons name="pie-chart-outline" size={22} color="#FFBB00" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Estructura de gastos</Text>
                <Text style={styles.menuSub}>Editá tus gastos fijos y variables</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFBB00" />
            </TouchableOpacity>
          </View>

          {/* Seguridad */}
          <Text style={styles.sectionTitle}>Seguridad</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}>
                <Ionicons name="lock-closed-outline" size={22} color="#FF3B30" />
              </View>

              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Contraseña</Text>
                <Text style={styles.menuSub}>Cambiá tu contraseña para proteger tu cuenta</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <View style={{ height: vh * 3 }} />
        </ScrollView>
      </Layout>

      {/* Bottom Sheet */}
      <Modal visible={sheetVisible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Handle */}
          <View style={styles.sheetHandle} />
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Información personal</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Ionicons name="close" size={22} color="#003366" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <PersonalInfoEditor
              firstName={user?.firstName || ''}
              setFirstName={(first: string) => {
                if (user) {
                  setUser({
                    ...user,
                    firstName: first,
                  });
                }
              }}
              lastName={user?.lastName || ''}
              setLastName={(last: string) => {
                if (user) {
                  setUser({
                    ...user,
                    lastName: last,
                  });
                }
              }}
              email={user?.email || ''}
              onSaveName={handleSaveName}
              onSaveEmail={handleSaveEmail}
              saving={saving}
            />
            <View style={{ height: vh * 3 }} />
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    padding: screenWidth * 0.05,
    paddingTop: vh * 2,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: vh * 2.5,
    padding: screenWidth * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    gap: 6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: vh * 1.5,
    gap: 12,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
  },
  menuSub: {
    fontSize: 13,
    color: '#6b8aa1',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF6FB',
    marginHorizontal: screenWidth * 0.04,
  },

  // Bottom Sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: vh * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#c8dff0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6FB',
    marginBottom: vh * 1.5,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#003366',
  },
});

export default ProfileScreen;
