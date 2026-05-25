import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import PasswordEditor from './PasswordEditor';
import {
  profileColors,
  profileLayout,
  profileSheetShadow,
  profileSharedStyles,
} from '../../styles/profileStyles';

const { screenWidth, vh } = profileLayout;
const SHEET_HEIGHT = vh * 55;

export interface PasswordSheetProps {
  visible: boolean;
  translateY: Animated.Value;
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
  translateY,
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
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Cambiar contraseña</Text>

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

            <View style={{ height: vh * 3 }} />
          </ScrollView>
        </Animated.View>
      </Modal>

      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.overlay} />

        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>Confirmar cambio de contraseña</Text>

          <Text style={styles.confirmSubtitle}>
            Por seguridad, se cerrará tu sesión al realizar este cambio.
          </Text>

          {confirmError && <Text style={styles.errorText}>{confirmError}</Text>}

          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={[styles.cancelBtn]}
              disabled={confirmLoading}
              onPress={() => onConfirmPasswordChange(false)}
            >
              <Text>No cambiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn]}
              disabled={confirmLoading}
              onPress={() => onConfirmPasswordChange(true)}
            >
              <Text style={{ color: '#fff' }}>
                {confirmLoading ? 'Procesando...' : 'Sí, cambiar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: profileSharedStyles.overlay,
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: profileColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: vh * 2,
    ...profileSheetShadow,
  },
  sheetHandle: profileSharedStyles.sheetHandle,
  sheetHeader: profileSharedStyles.sheetHeader,
  sheetTitle: profileSharedStyles.sheetTitle,
  confirmBox: {
    position: 'absolute',
    top: '35%',
    left: 20,
    right: 20,
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
  errorText: profileSharedStyles.errorText,
});

export default PasswordSheet;
