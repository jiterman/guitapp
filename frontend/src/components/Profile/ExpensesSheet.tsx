import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@ui-kitten/components';
import ExpensesEditor from './ExpensesEditor';
import {
  profileColors,
  profileLayout,
  profileSharedStyles,
  profileSheetShadow,
} from '../../styles/profileStyles';

const { screenWidth, vh } = profileLayout;

type Props = {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  user: any;
  onSave: (f: number, v: number) => Promise<any> | any;
  error: string | null;
  onInputChange?: () => void;
};

const ExpensesSheet: React.FC<Props> = ({
  visible,
  scale,
  opacity,
  onClose,
  user,
  onSave,
  error,
  onInputChange,
}) => {
  const handleSave = async (f: number, v: number) => {
    const result = await onSave(f, v);
    if (result) {
      onClose();
      alert('Estructura de gastos actualizada correctamente');
    }
  };

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
            <Text style={styles.sheetTitle}>Estructura de gastos</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#003366" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ExpensesEditor
              fixedDefault={user?.targetFixedExpenses ?? 0}
              variableDefault={user?.targetVariableExpenses ?? 0}
              onSave={handleSave}
              externalError={error}
              onChangeInput={onInputChange}
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
    paddingBottom: vh * 2,
    ...profileSheetShadow,
  },
  sheetHeader: profileSharedStyles.sheetHeader,
  sheetTitle: profileSharedStyles.sheetTitle,
});

export default ExpensesSheet;
