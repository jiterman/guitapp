import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import PasswordEditor from './PasswordEditor';
import { profileColors, profileModalStyles, profileSharedStyles } from '../../styles/profileStyles';

export interface PasswordSheetProps {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  saving: boolean;
  passwordError: string | null;
  confirmVisible: boolean;
  confirmLoading: boolean;
  confirmError: string | null;
  onSavePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onConfirmPasswordChange: (confirmed: boolean) => Promise<void>;
  onPasswordInputChange: () => void;
}

const PasswordSheet: React.FC<PasswordSheetProps> = ({
  visible,
  scale,
  opacity,
  onClose,
  saving,
  passwordError,
  confirmVisible,
  confirmLoading,
  confirmError,
  onSavePassword,
  onConfirmPasswordChange,
  onPasswordInputChange,
}) => {
  return (
    <>
      <Modal visible={visible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[profileModalStyles.overlay, { opacity }]} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          style={profileModalStyles.centeredContainer}
          behavior="height"
          pointerEvents="box-none"
        >
          <Animated.View style={[profileModalStyles.card, { transform: [{ scale }], opacity }]}>
            <View style={profileSharedStyles.sheetHeader}>
              <Text style={profileSharedStyles.sheetTitle}>Cambiar contraseña</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color="#003366" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <PasswordEditor
                onSave={onSavePassword}
                saving={saving}
                externalError={passwordError}
                onChangeInput={onPasswordInputChange}
              />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={profileModalStyles.overlay} />
        <View style={profileModalStyles.centeredContainer} pointerEvents="box-none">
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Confirmar cambio de contraseña</Text>
            <Text style={styles.confirmSubtitle}>
              Por seguridad, se cerrará tu sesión al realizar este cambio.
            </Text>
            {confirmError && <Text style={profileSharedStyles.errorText}>{confirmError}</Text>}
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                disabled={confirmLoading}
                onPress={() => onConfirmPasswordChange(false)}
              >
                <Text>No cambiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                disabled={confirmLoading}
                onPress={() => onConfirmPasswordChange(true)}
              >
                <Text style={{ color: '#fff' }}>
                  {confirmLoading ? 'Procesando...' : 'Sí, cambiar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  confirmBox: {
    width: '100%',
    backgroundColor: profileColors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: profileColors.navy,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 13,
    color: profileColors.muted,
    marginBottom: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: profileColors.divider,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: profileColors.danger,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default PasswordSheet;
