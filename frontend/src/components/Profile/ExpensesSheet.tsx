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
import ExpensesEditor from './ExpensesEditor';
import { profileModalStyles, profileSharedStyles } from '../../styles/profileStyles';

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
        <Animated.View style={[profileModalStyles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={profileModalStyles.centeredContainer}
        behavior="height"
        pointerEvents="box-none"
      >
        <Animated.View style={[profileModalStyles.card, { transform: [{ scale }], opacity }]}>
          <View style={profileSharedStyles.sheetHeader}>
            <Text style={profileSharedStyles.sheetTitle}>Estructura de gastos</Text>
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

export default ExpensesSheet;
