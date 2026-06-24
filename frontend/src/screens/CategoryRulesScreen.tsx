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
  const { rules, addRule, setRules } = useRules();

  const createRuleModal = useModal();
  const editRuleModal = useModal();

  const [selectedRule, setSelectedRule] = useState<CategoryRuleResponse | null>(null);

  const [saving, setSaving] = useState(false);

  const [screenLoading, setScreenLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const fetchRulesIfEmpty = async () => {
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
    } catch (e) {
      // Re-throw so the modal can display the error message inline.
      throw e;
    } finally {
      setSaving(false);
    }
  };
  return (
    <Layout style={rulesScreenStyles.container}>
      <View style={rulesScreenStyles.headerRow}>
        <View style={rulesScreenStyles.titleRow}>
          <Text style={rulesScreenStyles.title}>Reglas por categoría</Text>
          {rules.length > 0 && (
            <View style={rulesScreenStyles.countBadge}>
              <Text style={rulesScreenStyles.countBadgeText}>{rules.length}</Text>
            </View>
          )}
        </View>
        <Text style={rulesScreenStyles.subtitle}>
          Creá reglas personalizadas para clasificar tus gastos como fijos o variables según su
          categoría.
        </Text>
      </View>

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
              <View style={rulesScreenStyles.emptyIconCircle}>
                <Ionicons name="pricetags-outline" size={34} color="#07a3e4" />
              </View>
              <Text style={rulesScreenStyles.emptyTitle}>Todavía no tenés reglas</Text>
              <Text style={rulesScreenStyles.emptyText}>
                Creá tu primera regla para que tus gastos se clasifiquen solos según su categoría.
              </Text>
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
      />
    </Layout>
  );
}
