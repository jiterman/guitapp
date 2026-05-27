import React from 'react';
import {
  View,
  ScrollView,
  Animated,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

import PersonalInfoEditor from './PersonalInfoEditor';
import type { UserProfile } from '../../context/user';
import { profileModalStyles, profileSharedStyles } from '../../styles/profileStyles';

interface PersonalInfoSheetProps {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  user: UserProfile | null;
  saving: boolean;
  onSaveName: (firstName: string, lastName: string) => Promise<void>;
  onSaveEmail: (email: string) => Promise<void>;
}

const PersonalInfoSheet: React.FC<PersonalInfoSheetProps> = ({
  visible,
  scale,
  opacity,
  onClose,
  user,
  saving,
  onSaveName,
  onSaveEmail,
}) => {
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
            <Text style={profileSharedStyles.sheetTitle}>Información personal</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#003366" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <PersonalInfoEditor
              firstName={user?.firstName || ''}
              lastName={user?.lastName || ''}
              email={user?.email || ''}
              onSaveName={onSaveName}
              onSaveEmail={onSaveEmail}
              saving={saving}
            />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PersonalInfoSheet;
