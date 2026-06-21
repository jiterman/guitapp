import React from 'react';
import {
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui-kitten/components';

import NotificationFrequencyEditor from './NotificationFrequencyEditor';
import type { NotificationFrequency, UserProfile } from '../../context/user';
import { profileModalStyles, profileSharedStyles } from '../../styles/profileStyles';
import { useDialog } from '../../context/dialog';

type Props = {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  user: UserProfile | null;
  saving: boolean;
  error: string | null;
  onSave: (frequency: NotificationFrequency) => Promise<unknown> | unknown;
  onChange?: () => void;
};

const NotificationFrequencySheet: React.FC<Props> = ({
  visible,
  scale,
  opacity,
  onClose,
  user,
  saving,
  error,
  onSave,
  onChange,
}) => {
  const { alert } = useDialog();

  const handleSave = async (frequency: NotificationFrequency) => {
    const result = await onSave(frequency);
    if (result) {
      onClose();
      await alert({
        title: 'Listo',
        message: 'Frecuencia de notificaciones actualizada correctamente',
      });
    }
  };

  return (
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
            <Text style={profileSharedStyles.sheetTitle}>Frecuencia de avisos</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#003366" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <NotificationFrequencyEditor
              currentFrequency={user?.notificationFrequency}
              saving={saving}
              externalError={error}
              onSave={handleSave}
              onChange={onChange}
            />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default NotificationFrequencySheet;
