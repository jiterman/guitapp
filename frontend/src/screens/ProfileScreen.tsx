import React, { useState } from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Layout } from '@ui-kitten/components';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';
import { useUser } from '../context/user';
import { useRules } from '../context/rules';
import { router } from 'expo-router';
import ProfileMenuItem from '../components/Profile/ProfileMenuItem';
import PersonalInfoSheet from '../components/Profile/PersonalInfoSheet';
import PasswordSheet from '../components/Profile/PasswordSheet';
import ProfileHeaderCard from '../components/Profile/ProfileHeaderCard';
import ProfileSection from '../components/Profile/ProfileSection';
import { useModal } from '../hooks/Profile/useModal';
import { usePersonalInfo } from '../hooks/Profile/usePersonalInfo';
import { usePasswordChange } from '../hooks/Profile/usePasswordChange';
import ExpensesSheet from '../components/Profile/ExpensesSheet';
import { useExpensesStructure } from '../hooks/Profile/useExpensesStructure';
import NotificationChannelSheet from '../components/Profile/NotificationChannelSheet';
import NotificationFrequencySheet from '../components/Profile/NotificationFrequencySheet';
import { useNotificationChannel } from '../hooks/Profile/useNotificationChannel';
import { useNotificationFrequency } from '../hooks/Profile/useNotificationFrequency';
import { profileColors } from '../styles/profileStyles';
import AppDialog from '../components/AppDialog/AppDialog';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const ProfileScreen: React.FC = () => {
  const { user, setUser, getCreatedMonth, getCreatedYear } = useUser();
  const { setRules } = useRules();
  const [tutorialsDialogVisible, setTutorialsDialogVisible] = useState(false);

  const handleLogout = async () => {
    await authService.removeToken();
    setUser(null);
    setRules([]);
    router.replace('/login');
  };

  const handleResetTutorials = async () => {
    try {
      await SecureStore.deleteItemAsync('hasSeenHomeGuide');
      await SecureStore.deleteItemAsync('hasSeenAddMovementGuide');
      setTutorialsDialogVisible(true);
    } catch {
      // ignore
    }
  };

  const personalInfoSheet = useModal();
  const passwordSheet = useModal();
  const expensesSheet = useModal();
  const notificationsSheet = useModal();
  const notificationFrequencySheet = useModal();

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

  const notifications = useNotificationChannel({
    user,
    setUser,
    onSuccess: () => {},
  });

  const notificationFrequency = useNotificationFrequency({
    user,
    setUser,
    onSuccess: () => {},
  });

  const saving =
    personalInfoSaving ||
    passwordSaving ||
    expenses.saving ||
    notifications.saving ||
    notificationFrequency.saving;

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
                setUser({ ...user, avatarUrl: url });
              }
            }}
          />

          <ProfileSection title="Cuenta">
            <ProfileMenuItem
              title="Información personal"
              subtitle="Editá tu nombre y correo electrónico"
              icon="person-outline"
              iconColor="#07a3e4"
              iconBackground="#E6F2FC"
              onPress={personalInfoSheet.open}
            />
          </ProfileSection>

          <ProfileSection title="Finanzas">
            <ProfileMenuItem
              title="Objetivos financieros"
              subtitle="Configurá tus ingresos estimados y los gastos fijos y variables"
              icon="pie-chart-outline"
              iconColor="#FFBB00"
              iconBackground="rgba(255,187,0,0.12)"
              onPress={expensesSheet.open}
            />
            <ProfileMenuItem
              title="Ingresos recurrentes"
              subtitle="Configurá ingresos que se registran automáticamente, como tu sueldo"
              icon="repeat-outline"
              iconColor="#1a9e5c"
              iconBackground="rgba(26,158,92,0.12)"
              onPress={() => router.push('/recurring-incomes')}
            />
            <ProfileMenuItem
              title="Gastos recurrentes"
              subtitle="Configurá gastos que se registran automáticamente, como suscripciones o alquiler"
              icon="repeat-outline"
              iconColor="#c0392b"
              iconBackground="rgba(192,57,43,0.12)"
              onPress={() => router.push('/recurring-expenses')}
            />
          </ProfileSection>

          <ProfileSection title="Notificaciones">
            <ProfileMenuItem
              title="Medio de aviso"
              subtitle="Elegí si querés recibir los avisos en el celular o por correo"
              icon="notifications-outline"
              iconColor="#07a3e4"
              iconBackground="#E6F2FC"
              onPress={notificationsSheet.open}
            />
            <ProfileMenuItem
              title="Frecuencia de avisos"
              subtitle="Instantáneas, resumen diario o resumen semanal"
              icon="time-outline"
              iconColor="#07a3e4"
              iconBackground="#E6F2FC"
              onPress={notificationFrequencySheet.open}
            />
          </ProfileSection>

          <ProfileSection title="Reglas">
            <ProfileMenuItem
              title="Reglas por categoría"
              subtitle="Definí si los gastos de cada categoría son fijos o variables"
              icon="options-outline"
              iconColor="#8A4FFF"
              iconBackground="rgba(138, 79, 255, 0.12)"
              onPress={() => router.push('/category-rules')}
            />
          </ProfileSection>

          <ProfileSection title="Ayuda">
            <ProfileMenuItem
              title="Reiniciar tutoriales"
              subtitle="Volvé a ver las guías interactivas de la app"
              icon="book-outline"
              iconColor="#FF9500"
              iconBackground="rgba(255, 149, 0, 0.12)"
              onPress={handleResetTutorials}
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
            <ProfileMenuItem
              title="Cerrar sesión"
              subtitle="Salí de tu cuenta"
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
        scale={personalInfoSheet.scale}
        opacity={personalInfoSheet.opacity}
        onClose={personalInfoSheet.close}
        user={user}
        saving={saving}
        onSaveName={handleSaveName}
        onSaveEmail={handleSaveEmail}
      />

      <PasswordSheet
        visible={passwordSheet.visible}
        scale={passwordSheet.scale}
        opacity={passwordSheet.opacity}
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
        scale={expensesSheet.scale}
        opacity={expensesSheet.opacity}
        onClose={() => {
          expensesSheet.close();
          expenses.clearError?.();
        }}
        user={user}
        onSave={expenses.handleSave}
        error={expenses.error}
        onInputChange={expenses.handleInputChange}
      />

      <NotificationChannelSheet
        visible={notificationsSheet.visible}
        scale={notificationsSheet.scale}
        opacity={notificationsSheet.opacity}
        onClose={() => {
          notificationsSheet.close();
          notifications.clearError();
        }}
        user={user}
        saving={notifications.saving}
        error={notifications.error}
        onSave={notifications.handleSave}
        onChange={notifications.clearError}
      />

      <NotificationFrequencySheet
        visible={notificationFrequencySheet.visible}
        scale={notificationFrequencySheet.scale}
        opacity={notificationFrequencySheet.opacity}
        onClose={() => {
          notificationFrequencySheet.close();
          notificationFrequency.clearError();
        }}
        user={user}
        saving={notificationFrequency.saving}
        error={notificationFrequency.error}
        onSave={notificationFrequency.handleSave}
        onChange={notificationFrequency.clearError}
      />

      <AppDialog
        visible={tutorialsDialogVisible}
        title="Guías Reiniciadas"
        message="Las guías interactivas se volverán a mostrar cuando navegues a la pantalla de Inicio o Carga de Gasto."
        confirmText="Entendido"
        onConfirm={() => setTutorialsDialogVisible(false)}
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
    paddingBottom: vh * 1.5,
  },
});

export default ProfileScreen;
