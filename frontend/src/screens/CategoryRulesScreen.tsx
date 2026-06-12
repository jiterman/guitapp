import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useModal } from '../hooks/Profile/useModal';
import { CategoryRuleCard } from '../components/Rules/CategoryRule/Card/CategoryRuleCard';
import { CategoryRuleModal } from '../components/Rules/CategoryRule/Modal/CategoryRuleModal';
import { EditCategoryRuleModal } from '../components/Rules/CategoryRule/Modal/EditCategoryRuleModal';
import { ExpenseCategory } from '../constants/categories';
import { ruleService, CategoryRuleResponse } from '../services/ruleService';
import { rulesScreenStyles } from '../styles/rulesStyles';
import { useRules } from '../context/rules';

export default function CategoryRulesScreen() {
  const { rules, addRule, updateRuleInState, setRules } = useRules();

  const createRuleModal = useModal();
  const editRuleModal = useModal();

  const [selectedRule, setSelectedRule] = useState<CategoryRuleResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados locales para controlar el flujo de auto-recuperación
  const [screenLoading, setScreenLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Mecanismo de Auto-Recuperación (Lazy Loading)
  useEffect(() => {
    const fetchRulesIfEmpty = async () => {
      // Si ya hay reglas en memoria o ya intentamos buscarlas en esta sesión, cancelamos
      if (rules.length > 0 || hasChecked) return;

      setScreenLoading(true);
      try {
        const rulesData = await ruleService.getCategoryRules();
        setRules(rulesData);
      } catch (err) {
        console.warn('Fallo también la auto-recuperación de reglas en la Screen:', err);
      } finally {
        setScreenLoading(false);
        setHasChecked(true);
      }
    };

    fetchRulesIfEmpty();
  }, [rules.length, hasChecked, setRules]);

  const handleOpenEdit = (rule: CategoryRuleResponse) => {
    setSelectedRule(rule);
    editRuleModal.open();
  };

  const handleOpenCreate = () => {
    setSelectedRule(null);
    createRuleModal.open();
  };

  const handleCreateRule = async (categoryValue: string, type: 'FIXED' | 'VARIABLE') => {
    setSaving(true);
    try {
      const response = await ruleService.createCategoryRule({
        category: categoryValue as ExpenseCategory,
        type: type,
      });
      addRule(response);
      createRuleModal.close();
    } catch (e: any) {
      console.error('Error detectado al crear:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRule = async (type: 'FIXED' | 'VARIABLE') => {
    if (!selectedRule) return;
    setSaving(true);
    try {
      // TODO: Lógica de actualización (service y contexto)
      updateRuleInState(selectedRule.id, type);
      editRuleModal.close();
    } catch (e: any) {
      console.error('Error detectado al actualizar:', e);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!selectedRule) return;
    setDeleting(true);
    try {
      // TODO: Lógica de eliminación (service y contexto)
      editRuleModal.close();
    } catch (e: any) {
      console.error('Error detectado al eliminar:', e);
      throw e;
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout style={rulesScreenStyles.container}>
      <View style={rulesScreenStyles.headerRow}>
        <Text style={rulesScreenStyles.title}>Reglas por categoría</Text>
      </View>

      {/* Recuperando reglas del backend */}
      {screenLoading ? (
        <View style={rulesScreenStyles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text appearance="hint" style={{ marginTop: 12 }}>
            Cargando tus reglas...
          </Text>
        </View>
      ) : (
        <FlatList
          data={rules}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <CategoryRuleCard rule={item} onPress={handleOpenEdit} />}
          ItemSeparatorComponent={() => <View style={rulesScreenStyles.separator} />}
          contentContainerStyle={rulesScreenStyles.listPadding}
          ListEmptyComponent={
            <View style={rulesScreenStyles.emptyContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color="#6c757d"
                style={{ marginBottom: 8 }}
              />
              <Text appearance="hint">No tenés reglas configuradas aún.</Text>
            </View>
          }
        />
      )}

      <View style={rulesScreenStyles.footerContainer}>
        <TouchableOpacity
          style={rulesScreenStyles.footerButton}
          onPress={handleOpenCreate}
          disabled={screenLoading}
          activeOpacity={0.8}
        >
          <Text style={rulesScreenStyles.footerButtonText}>Crear nueva regla</Text>
        </TouchableOpacity>
      </View>

      <CategoryRuleModal
        visible={createRuleModal.visible}
        scale={createRuleModal.scale}
        opacity={createRuleModal.opacity}
        onClose={createRuleModal.close}
        rule={null}
        onSave={handleCreateRule}
        saving={saving}
      />

      <EditCategoryRuleModal
        visible={editRuleModal.visible}
        scale={editRuleModal.scale}
        opacity={editRuleModal.opacity}
        onClose={editRuleModal.close}
        rule={selectedRule}
        onUpdate={handleUpdateRule}
        onDelete={handleDeleteRule}
        saving={saving}
        deleting={deleting}
      />
    </Layout>
  );
}
