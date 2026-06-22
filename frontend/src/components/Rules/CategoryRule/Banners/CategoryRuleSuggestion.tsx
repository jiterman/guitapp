import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useRules } from '../../../../context/rules';
import { ExpenseCategoryOption } from '../../../../constants/categories';

interface CategoryRuleSuggestionProps {
  movementType: 'EXPENSE' | 'INCOME';
  selectedCategory: ExpenseCategoryOption | any | null;
  selectedExpenseType: 'FIXED' | 'VARIABLE' | null;
  checked: boolean;
  onToggle: () => void;
}

export const CategoryRuleSuggestion: React.FC<CategoryRuleSuggestionProps> = ({
  movementType,
  selectedCategory,
  selectedExpenseType,
  checked,
  onToggle,
}) => {
  const { rules } = useRules();

  if (movementType !== 'EXPENSE' || !selectedCategory || !selectedExpenseType) {
    return null;
  }

  const isOtherCategory =
    selectedCategory.value?.toUpperCase() === 'OTHERS' ||
    selectedCategory.value?.toUpperCase() === 'OTHER';

  if (isOtherCategory) return null;

  // Hide the suggestion if a rule already exists for this category.
  const alreadyHasRule = rules.some(rule => rule.category === selectedCategory.value);
  if (alreadyHasRule) return null;

  // Only suggest when the chosen type differs from the category default.
  const isDifferentFromDefault = selectedExpenseType !== selectedCategory.defaultType;
  if (!isDifferentFromDefault) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.8}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>

      <Text style={styles.suggestionText}>
        Crear una <Text style={styles.boldText}>regla</Text> para asignar{' '}
        <Text style={styles.boldText}>{selectedCategory.label}</Text> como gasto{' '}
        <Text style={styles.boldText}>{selectedExpenseType === 'FIXED' ? 'fijo' : 'variable'}</Text>{' '}
        automáticamente.
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#B9E6FE',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#07a3e4',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#07a3e4',
  },
  suggestionText: {
    fontSize: 13,
    color: '#0369A1',
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0369A1',
  },
});
