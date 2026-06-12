import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useRules } from '../../../../context/rules';
import { ExpenseCategoryOption } from '../../../../constants/categories';

interface CategoryRuleSuggestionProps {
  movementType: 'EXPENSE' | 'INCOME';
  selectedCategory: ExpenseCategoryOption | any | null;
  selectedExpenseType: 'FIXED' | 'VARIABLE' | null;
  onAcceptSuggestion: (categoryValue: string, type: 'FIXED' | 'VARIABLE') => void;
}

export const CategoryRuleSuggestion: React.FC<CategoryRuleSuggestionProps> = ({
  movementType,
  selectedCategory,
  selectedExpenseType,
  onAcceptSuggestion,
}) => {
  const { rules } = useRules();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [selectedCategory, selectedExpenseType]);

  if (!isVisible || movementType !== 'EXPENSE' || !selectedCategory || !selectedExpenseType) {
    return null;
  }

  const isOtherCategory =
    selectedCategory.value?.toUpperCase() === 'OTHERS' ||
    selectedCategory.value?.toUpperCase() === 'OTHER';

  if (isOtherCategory) return null;

  // Si ya existe en el contexto global de reglas, el aviso se oculta solo automáticamente
  const alreadyHasRule = rules.some(rule => rule.category === selectedCategory.value);
  if (alreadyHasRule) return null;

  const isDifferentFromDefault = selectedExpenseType !== selectedCategory.defaultType;
  if (!isDifferentFromDefault) return null;

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconBackground}>
          <Ionicons name="bulb-outline" size={16} color="#07a3e4" />
        </View>
        <Text style={styles.suggestionText}>
          ¿Deseas guardar <Text style={styles.boldText}>{selectedCategory.label}</Text> siempre como
          gasto{' '}
          <Text style={styles.boldText}>
            {selectedExpenseType === 'FIXED' ? 'Fijo' : 'Variable'}
          </Text>
          ?
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onAcceptSuggestion(selectedCategory.value, selectedExpenseType)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-sharp" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
          <Ionicons name="close" size={16} color="#90A4AE" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#B9E6FE',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  iconBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 13,
    color: '#0369A1',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#0369A1',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#07a3e4',
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#07a3e4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
