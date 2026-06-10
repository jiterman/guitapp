import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useModal } from '../hooks/Profile/useModal';
import { CategoryRuleCard } from '../components/CategoryRuleCard/CategoryRuleCard';
import { CategoryRuleModal } from '../components/CategoryRuleModal/CategoryRuleModal';
import { ExpenseCategory } from '../constants/categories';
import { ruleService, CategoryRuleResponse } from '../services/ruleService';
import { rulesScreenStyles } from '../styles/rulesStyles';
import { useRules } from '../context/rules';

export default function CategoryRulesScreen() {
  const { rules, addRule, updateRuleInState, setRules } = useRules();

  const ruleModal = useModal();
  const [selectedRule, setSelectedRule] = useState<CategoryRuleResponse | null>(null);
  const [saving, setSaving] = useState(false);

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
        setRules(rulesData); // Guardamos el resultado en el contexto global
      } catch (err) {
        console.warn('Fallo también la auto-recuperación de reglas en la Screen:', err);
      } finally {
        setScreenLoading(false);
        setHasChecked(true); // Marcamos como revisado para evitar un bucle infinito de peticiones
      }
    };

    fetchRulesIfEmpty();
  }, [rules.length, hasChecked, setRules]);

  const handleOpenEdit = (rule: CategoryRuleResponse) => {
    setSelectedRule(rule);
    ruleModal.open();
  };

  const handleOpenCreate = () => {
    setSelectedRule(null);
    ruleModal.open();
  };

  const handleSaveRule = async (categoryValue: string, type: 'FIXED' | 'VARIABLE') => {
    setSaving(true);
    try {
      if (selectedRule) {
        updateRuleInState(selectedRule.id, type);
        ruleModal.close();
      } else {
        const response = await ruleService.createCategoryRule({
          category: categoryValue as ExpenseCategory,
          type: type,
        });
        addRule(response);
        ruleModal.close();
      }
    } catch (e: any) {
      console.error('Error detectado en Screen:', e);
      throw e;
    } finally {
      setSaving(false);
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
          disabled={screenLoading} // Deshabilitamos el botón mientras se intenta auto-recuperar
          activeOpacity={0.8}
        >
          <Text style={rulesScreenStyles.footerButtonText}>Crear nueva regla</Text>
        </TouchableOpacity>
      </View>

      <CategoryRuleModal
        visible={ruleModal.visible}
        scale={ruleModal.scale}
        opacity={ruleModal.opacity}
        onClose={ruleModal.close}
        rule={selectedRule}
        onSave={handleSaveRule}
        saving={saving}
      />
    </Layout>
  );
}
