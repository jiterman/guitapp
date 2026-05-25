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

import PersonalInfoEditor from './PersonalInfoEditor';
import type { UserProfile } from '../../context/UserContext';
import {
  profileColors,
  profileLayout,
  profileSheetShadow,
  profileSharedStyles,
} from '../../styles/profileStyles';

const { screenWidth, vh } = profileLayout;

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
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={styles.centeredContainer}
        behavior="height"
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
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
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: profileColors.white,
    borderRadius: 20,
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh,
    paddingBottom: vh * 0.25,
    ...profileSheetShadow,
  },
  sheetHeader: profileSharedStyles.sheetHeader,
  sheetTitle: profileSharedStyles.sheetTitle,
});

export default PersonalInfoSheet;
