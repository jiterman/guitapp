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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;
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

export default PersonalInfoSheet;
