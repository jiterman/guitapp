import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Animated,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { EXPENSE_CATEGORIES } from '../../../../constants/categories';
import { CategoryRuleResponse } from '../../../../services/ruleService';
import { rulesModalStyles } from '../../../../styles/rulesStyles';

interface CategoryRuleModalProps {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  rule: CategoryRuleResponse | null;
  initialCategory?: string;
  initialType?: 'FIXED' | 'VARIABLE';
  onSave: (categoryValue: string, type: 'FIXED' | 'VARIABLE') => Promise<void>;
  saving: boolean;
}

export const CategoryRuleModal: React.FC<CategoryRuleModalProps> = ({
  visible,
  scale,
  opacity,
  onClose,
  rule,
  initialCategory,
  initialType,
  onSave,
  saving,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'FIXED' | 'VARIABLE'>('VARIABLE');
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedCategory(rule ? rule.category : (initialCategory ?? ''));
      setSelectedType(rule ? rule.type : (initialType ?? 'VARIABLE'));
      setError(null);
      setIsDropdownOpen(false);
    }
  }, [visible, rule, initialCategory, initialType]);

  // Buscamos la configuración de la categoría seleccionada actualmente para su renderizado
  const activeCategoryConfig = EXPENSE_CATEGORIES.find(c => c.value === selectedCategory);

  const handleCategorySelect = (value: string) => {
    if (rule) return;
    setSelectedCategory(value);
    setError(null);
    setIsDropdownOpen(false);

    const categoryConfig = EXPENSE_CATEGORIES.find(c => c.value === value);
    if (categoryConfig) {
      setSelectedType(categoryConfig.defaultType);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory) return;
    setError(null);

    try {
      await onSave(selectedCategory, selectedType);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un problema al guardar la regla.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[rulesModalStyles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <View style={rulesModalStyles.centeredContainer} pointerEvents="box-none">
        <Animated.View style={[rulesModalStyles.modalCard, { transform: [{ scale }], opacity }]}>
          <View style={rulesModalStyles.sheetHeader}>
            <Text style={rulesModalStyles.sheetTitle}>{'Nueva regla'}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#003366" />
            </TouchableOpacity>
          </View>

          <View style={rulesModalStyles.editBlock}>
            <View style={rulesModalStyles.inputRow}>
              <Text style={rulesModalStyles.inputLabel}>Si la categoría es:</Text>

              <TouchableOpacity
                style={[
                  rulesModalStyles.categoryOption,
                  activeCategoryConfig ? rulesModalStyles.categoryOptionActive : null,
                  localStyles.dropdownTrigger,
                  activeCategoryConfig ? { backgroundColor: '#fff', borderColor: '#e4e9f2' } : null,
                  !!rule && localStyles.dropdownDisabled,
                ]}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                activeOpacity={0.8}
                disabled={!!rule}
              >
                <View style={rulesModalStyles.categoryLeftInfo}>
                  <View
                    style={[
                      localStyles.iconContainer,
                      activeCategoryConfig
                        ? localStyles.iconContainerActive
                        : localStyles.iconContainerInactive,
                    ]}
                  >
                    <Ionicons
                      name={(activeCategoryConfig?.icon || 'help-circle-outline') as any}
                      size={18}
                      color={activeCategoryConfig ? '#07a3e4' : '#a6b9c7'}
                    />
                  </View>

                  <Text
                    style={[
                      rulesModalStyles.typeButtonText,
                      rulesModalStyles.categoryText,
                      !activeCategoryConfig && localStyles.placeholderText,
                    ]}
                  >
                    {activeCategoryConfig ? activeCategoryConfig.label : 'Seleccione una categoría'}
                  </Text>
                </View>

                {!rule && (
                  <Ionicons
                    name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#6b8aa1"
                  />
                )}
              </TouchableOpacity>

              {/* LISTA DESPLEGABLE (Solo se renderiza si isDropdownOpen es true) */}
              {isDropdownOpen && (
                <View style={[rulesModalStyles.listContainer, localStyles.expandedList]}>
                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    style={{ maxHeight: 180 }}
                  >
                    {EXPENSE_CATEGORIES.map(cat => {
                      const isSelected = selectedCategory === cat.value;
                      return (
                        <TouchableOpacity
                          key={cat.value}
                          style={[
                            rulesModalStyles.categoryOption,
                            isSelected && rulesModalStyles.categoryOptionActive,
                            localStyles.listItemRow,
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
              )}
            </View>

            <View style={rulesModalStyles.inputDivider} />

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
                  onPress={() => {
                    setSelectedType('FIXED');
                    setError(null);
                  }}
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
                  onPress={() => {
                    setSelectedType('VARIABLE');
                    setError(null);
                  }}
                >
                  <Text
                    style={[
                      rulesModalStyles.typeButtonText,
                      selectedType === 'VARIABLE'
                        ? rulesModalStyles.typeButtonTextActive
                        : rulesModalStyles.typeButtonTextInactive,
                    ]}
                  >
                    Variable
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View style={rulesModalStyles.errorRow}>
                <Text style={rulesModalStyles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                rulesModalStyles.saveButton,
                (!selectedCategory || saving) && { opacity: 0.6 },
                error ? { marginTop: 4 } : { marginTop: 12 },
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

const localStyles = StyleSheet.create({
  dropdownTrigger: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderWidth: 1,
    borderColor: '#e4e9f2',
    minHeight: 45,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconContainerActive: {
    backgroundColor: '#E6F4FA',
  },
  iconContainerInactive: {
    backgroundColor: '#F0F4F8',
  },
  dropdownDisabled: {
    backgroundColor: '#fff',
    borderColor: '#edf1f7',
    opacity: 0.9,
  },
  placeholderText: {
    color: '#a6b9c7',
    fontStyle: 'italic',
  },
  expandedList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#f2ede4ff',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  listItemRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
    borderRadius: 0,
    marginVertical: 0,
    paddingVertical: 12,
  },
});
