import React from 'react';
import {
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui-kitten/components';

import NotificationChannelEditor from './NotificationChannelEditor';
import type { NotificationChannel, UserProfile } from '../../context/user';
import { profileModalStyles, profileSharedStyles } from '../../styles/profileStyles';

type Props = {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  user: UserProfile | null;
  saving: boolean;
  error: string | null;
  onSave: (channel: NotificationChannel) => Promise<unknown> | unknown;
  onChange?: () => void;
};

const NotificationChannelSheet: React.FC<Props> = ({
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
  const handleSave = async (channel: NotificationChannel) => {
    const result = await onSave(channel);
    if (result) {
      onClose();
      Alert.alert('Listo', 'Preferencia de notificaciones actualizada correctamente');
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
            <Text style={profileSharedStyles.sheetTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#003366" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <NotificationChannelEditor
              currentChannel={user?.notificationChannel}
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

export default NotificationChannelSheet;
