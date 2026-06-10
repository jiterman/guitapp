import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Animated,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { CategoryRuleResponse } from '../CategoryRuleCard/CategoryRuleCard';
import { rulesModalStyles } from '../../styles/rulesStyles';

interface CategoryRuleModalProps {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  rule: CategoryRuleResponse | null;
  onSave: (categoryValue: string, type: 'FIXED' | 'VARIABLE') => Promise<void>;
  saving: boolean;
}

export const CategoryRuleModal: React.FC<CategoryRuleModalProps> = ({
  visible,
  scale,
  opacity,
  onClose,
  rule,
  onSave,
  saving,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'FIXED' | 'VARIABLE'>('VARIABLE');

  useEffect(() => {
    if (visible) {
      setSelectedCategory(rule ? rule.categoryId : '');
      setSelectedType(rule ? rule.expenseType : 'VARIABLE');
    }
  }, [visible, rule]);

  const handleCategorySelect = (value: string) => {
    if (rule) return;
    setSelectedCategory(value);

    const categoryConfig = EXPENSE_CATEGORIES.find(c => c.value === value);
    if (categoryConfig) {
      setSelectedType(categoryConfig.defaultType);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory) return;
    await onSave(selectedCategory, selectedType);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[rulesModalStyles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <View style={rulesModalStyles.centeredContainer} pointerEvents="box-none">
        <Animated.View style={[rulesModalStyles.modalCard, { transform: [{ scale }], opacity }]}>
          <View style={rulesModalStyles.sheetHeader}>
            <Text style={rulesModalStyles.sheetTitle}>{rule ? 'Editar regla' : 'Nueva regla'}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#003366" />
            </TouchableOpacity>
          </View>

          <View style={rulesModalStyles.editBlock}>
            {/* Campo 1: Selección de Categoría */}
            <View style={rulesModalStyles.inputRow}>
              <Text style={rulesModalStyles.inputLabel}>Si la categoría es:</Text>

              <View style={rulesModalStyles.listContainer}>
                <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
                  {EXPENSE_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <TouchableOpacity
                        key={cat.value}
                        style={[
                          rulesModalStyles.categoryOption,
                          isSelected && rulesModalStyles.categoryOptionActive,
                        ]}
                        onPress={() => handleCategorySelect(cat.value)}
                        disabled={!!rule}
                      >
                        <View style={rulesModalStyles.categoryLeftInfo}>
                          <Ionicons
                            name={cat.icon as any}
                            size={16}
                            color={isSelected ? '#07a3e4' : '#6b8aa1'}
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              rulesModalStyles.categoryText,
                              isSelected && rulesModalStyles.categoryTextActive,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color="#07a3e4" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Divisor inputDivider */}
            <View style={rulesModalStyles.inputDivider} />

            {/* Campo 2: Tipo de Gasto */}
            <View style={rulesModalStyles.inputRow}>
              <Text style={rulesModalStyles.inputLabel}>Entonces el tipo de gasto será:</Text>

              <View style={rulesModalStyles.typeContainer}>
                <TouchableOpacity
                  style={[
                    rulesModalStyles.typeButton,
                    selectedType === 'FIXED'
                      ? rulesModalStyles.typeButtonActive
                      : rulesModalStyles.typeButtonInactive,
                  ]}
                  onPress={() => setSelectedType('FIXED')}
                >
                  <Text
                    style={[
                      rulesModalStyles.typeButtonText,
                      selectedType === 'FIXED'
                        ? rulesModalStyles.typeButtonTextActive
                        : rulesModalStyles.typeButtonTextInactive,
                    ]}
                  >
                    Fijo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    rulesModalStyles.typeButton,
                    selectedType === 'VARIABLE'
                      ? rulesModalStyles.typeButtonActive
                      : rulesModalStyles.typeButtonInactive,
                  ]}
                  onPress={() => setSelectedType('VARIABLE')}
                >
                  {selectedType === 'VARIABLE' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={[
                          rulesModalStyles.typeButtonText,
                          rulesModalStyles.typeButtonTextActive,
                        ]}
                      >
                        Variable
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        rulesModalStyles.typeButtonText,
                        rulesModalStyles.typeButtonTextInactive,
                      ]}
                    >
                      Variable
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                rulesModalStyles.saveButton,
                (!selectedCategory || saving) && { opacity: 0.6 },
              ]}
              onPress={handleSave}
              disabled={!selectedCategory || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={rulesModalStyles.saveButtonText}>Guardar regla</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
