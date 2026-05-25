import React from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Layout } from '@ui-kitten/components';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { router } from 'expo-router';
import ProfileMenuItem from '../components/Profile/ProfileMenuItem';
import PersonalInfoSheet from '../components/Profile/PersonalInfoSheet';
import PasswordSheet from '../components/Profile/PasswordSheet';
import ProfileHeaderCard from '../components/Profile/ProfileHeaderCard';
import ProfileSection from '../components/Profile/ProfileSection';
import { useBottomSheet } from '../hooks/Profile/useBottomSheet';
import { usePersonalInfo } from '../hooks/Profile/usePersonalInfo';
import { usePasswordChange } from '../hooks/Profile/usePasswordChange';
import ExpensesSheet from '../components/Profile/ExpensesSheet';
import { useExpensesStructure } from '../hooks/Profile/useExpensesStructure';
import { profileColors } from '../styles/profileStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;
const SHEET_HEIGHT = vh * 55;

const ProfileScreen: React.FC = () => {
  const { user, setUser, getCreatedMonth, getCreatedYear } = useUser();

  const handleLogout = async () => {
    await authService.removeToken();
    setUser(null);
    router.replace('/login');
  };

  const personalInfoSheet = useBottomSheet(SHEET_HEIGHT);
  const passwordSheet = useBottomSheet(SHEET_HEIGHT);
  const expensesSheet = useBottomSheet(SHEET_HEIGHT);

  const {
    saving: personalInfoSaving,
    handleSaveName,
    handleSaveEmail,
  } = usePersonalInfo({
    user,
    setUser,
    onSuccess: personalInfoSheet.close,
  });

  const {
    saving: passwordSaving,
    passwordError,
    confirmVisible,
    confirmLoading,
    confirmError,
    handleSavePassword,
    handleConfirmPasswordChange,
    handlePasswordInputChange,
  } = usePasswordChange({
    onSuccess: passwordSheet.close,
    setUser,
  });

  const expenses = useExpensesStructure({
    user,
    setUser,
    onSuccess: () => {},
  });

  const saving = personalInfoSaving || passwordSaving || expenses.saving;

  return (
    <>
      <Layout style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileHeaderCard
            user={user}
            getCreatedMonth={getCreatedMonth}
            getCreatedYear={getCreatedYear}
            onAvatarUploaded={(url: string) => {
              if (user) {
                setUser({
                  ...user,
                  avatarUrl: url,
                });
              }
            }}
          />

          <ProfileSection title="Cuenta">
            <ProfileMenuItem
              title="Información personal"
              subtitle="Editá tu nombre y correo electrónico."
              icon="person-outline"
              iconColor="#07a3e4"
              iconBackground="#E6F2FC"
              onPress={personalInfoSheet.open}
            />
          </ProfileSection>

          <ProfileSection title="Finanzas">
            <ProfileMenuItem
              title="Estructura de gastos"
              subtitle="Editar gastos fijos y variables"
              icon="pie-chart-outline"
              iconColor="#FFBB00"
              iconBackground="rgba(255,187,0,0.12)"
              onPress={expensesSheet.open}
            />
          </ProfileSection>

          <ProfileSection title="Seguridad">
            <ProfileMenuItem
              title="Contraseña"
              subtitle="Cambiá tu contraseña para proteger tu cuenta"
              icon="lock-closed-outline"
              iconColor="#FF3B30"
              iconBackground="rgba(255, 59, 48, 0.12)"
              onPress={passwordSheet.open}
            />
          </ProfileSection>

          <ProfileSection title="">
            <ProfileMenuItem
              title="Cerrar sesión"
              icon="log-out-outline"
              iconColor="#6c757d"
              iconBackground="rgba(108, 117, 125, 0.12)"
              onPress={handleLogout}
            />
          </ProfileSection>
        </ScrollView>
      </Layout>

      <PersonalInfoSheet
        visible={personalInfoSheet.visible}
        translateY={personalInfoSheet.translateY}
        onClose={personalInfoSheet.close}
        user={user}
        saving={saving}
        onSaveName={handleSaveName}
        onSaveEmail={handleSaveEmail}
      />

      <PasswordSheet
        visible={passwordSheet.visible}
        translateY={passwordSheet.translateY}
        onClose={passwordSheet.close}
        saving={saving}
        passwordError={passwordError}
        confirmVisible={confirmVisible}
        confirmLoading={confirmLoading}
        confirmError={confirmError}
        onSavePassword={handleSavePassword}
        onConfirmPasswordChange={handleConfirmPasswordChange}
        onPasswordInputChange={handlePasswordInputChange}
      />

      <ExpensesSheet
        visible={expensesSheet.visible}
        translateY={expensesSheet.translateY}
        onClose={expensesSheet.close}
        user={user}
        onSave={expenses.handleSave}
        error={expenses.error}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: profileColors.background,
  },
  scrollContent: {
    padding: screenWidth * 0.05,
    paddingTop: vh * 2,
    paddingBottom: vh * 3,
  },
});

export default ProfileScreen;
