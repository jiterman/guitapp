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

import PersonalInfoEditor from './PersonalInfoEditor';
import type { UserProfile } from '../../context/UserContext';
import {
  profileColors,
  profileLayout,
  profileSheetShadow,
  profileSharedStyles,
} from '../../styles/profileStyles';

const { screenWidth, vh } = profileLayout;
const SHEET_HEIGHT = vh * 55;

interface PersonalInfoSheetProps {
  visible: boolean;
  translateY: Animated.Value;
  onClose: () => void;

  user: UserProfile | null;

  saving: boolean;

  onSaveName: (firstName: string, lastName: string) => Promise<void>;
  onSaveEmail: (email: string) => Promise<void>;
}

const PersonalInfoSheet: React.FC<PersonalInfoSheetProps> = ({
  visible,
  translateY,
  onClose,
  user,
  saving,
  onSaveName,
  onSaveEmail,
}) => {
  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Información personal</Text>

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

          <View style={{ height: vh * 3 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
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
});

export default PersonalInfoSheet;
