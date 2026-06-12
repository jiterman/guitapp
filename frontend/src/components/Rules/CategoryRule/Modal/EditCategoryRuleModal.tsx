import React, { useState, useEffect } from 'react';
import {
  View,
  Animated,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons, Feather } from '@expo/vector-icons';
import { EXPENSE_CATEGORIES } from '../../../../constants/categories';
import { CategoryRuleResponse, ruleService } from '../../../../services/ruleService';
import { rulesModalStyles } from '../../../../styles/rulesStyles';
import { useRules } from '../../../../context/rules';

interface EditCategoryRuleModalProps {
  visible: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  onClose: () => void;
  rule: CategoryRuleResponse | null;
}

export const EditCategoryRuleModal: React.FC<EditCategoryRuleModalProps> = ({
  visible,
  scale,
  opacity,
  onClose,
  rule,
}) => {
  const { updateRuleInState, removeRuleFromState } = useRules();

  const [selectedType, setSelectedType] = useState<'FIXED' | 'VARIABLE'>('VARIABLE');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasChanged = rule ? selectedType !== rule.type : false;

  const matchedCategory = EXPENSE_CATEGORIES.find(c => c.value === rule?.category);
  const categoryLabel = matchedCategory?.label || rule?.category || '';
  const categoryIcon = matchedCategory?.icon || 'bookmark-outline';

  useEffect(() => {
    if (visible && rule) {
      setSelectedType(rule.type);
      setError(null);
      setIsSaving(false);
      setIsDeleting(false);
    }
  }, [visible, rule]);

  const handleUpdate = async () => {
    if (!rule) return;
    setError(null);

    if (!hasChanged) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await ruleService.updateCategoryRule(rule.id, {
        type: selectedType,
      });
      updateRuleInState(rule.id, selectedType);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un problema al actualizar la regla.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!rule) return;
    setError(null);
    setIsDeleting(true);

    try {
      await ruleService.deleteCategoryRule(rule.id);
      removeRuleFromState(rule.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un problema al eliminar la regla.');
    } finally {
      setIsDeleting(false);
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
            <Text style={rulesModalStyles.sheetTitle}>Editar regla</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isSaving || isDeleting}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ opacity: isSaving || isDeleting ? 0.5 : 1 }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ff4d4d" />
                ) : (
                  <Feather name="trash-2" size={19} color="#c0392b" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                disabled={isSaving || isDeleting}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#003366" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={rulesModalStyles.editBlock}>
            <View style={rulesModalStyles.inputRow}>
              <Text style={rulesModalStyles.inputLabel}>Si la categoría es:</Text>

              <View
                style={[
                  rulesModalStyles.categoryOption,
                  rulesModalStyles.categoryOptionActive,
                  { borderColor: '#e4e9f2', backgroundColor: '#f7f9fc' },
                ]}
              >
                <View style={rulesModalStyles.categoryLeftInfo}>
                  <Ionicons
                    name={categoryIcon as any}
                    size={16}
                    color="#003366"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[rulesModalStyles.categoryText, { color: '#003366', fontWeight: '600' }]}
                  >
                    {categoryLabel}
                  </Text>
                </View>
                <Ionicons name="lock-closed-outline" size={16} color="#6b8aa1" />
              </View>
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
                  disabled={isSaving || isDeleting}
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
                  disabled={isSaving || isDeleting}
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
                isSaving && { opacity: 0.6 },
                error ? { marginTop: 4 } : { marginTop: 12 },
              ]}
              onPress={handleUpdate}
              disabled={isSaving || isDeleting}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={rulesModalStyles.saveButtonText}>
                  {hasChanged ? 'Guardar cambios' : 'Cerrar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
