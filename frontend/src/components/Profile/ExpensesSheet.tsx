import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

import { Text } from '@ui-kitten/components';
import ExpensesEditor from './ExpensesEditor';
import {
  profileColors,
  profileLayout,
  profileSharedStyles,
  profileSheetShadow,
} from '../../styles/profileStyles';

const { screenWidth, vh } = profileLayout;
const SHEET_HEIGHT = vh * 55;

type Props = {
  visible: boolean;
  translateY: any;
  onClose: () => void;
  user: any;
  onSave: (f: number, v: number) => void;
  error: string | null;
  onInputChange?: () => void;
};

const ExpensesSheet: React.FC<Props> = ({
  visible,
  translateY,
  onClose,
  user,
  onSave,
  error,
  onInputChange,
}) => {
  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Estructura de gastos</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ExpensesEditor
            fixedDefault={user?.targetFixedExpenses ?? 0}
            variableDefault={user?.targetVariableExpenses ?? 0}
            onSave={onSave}
            externalError={error}
            onChangeInput={onInputChange}
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

export default ExpensesSheet;
