import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
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
  const { rules, addRule, updateRuleInState } = useRules();

  const ruleModal = useModal();
  const [selectedRule, setSelectedRule] = useState<CategoryRuleResponse | null>(null);
  const [saving, setSaving] = useState(false);

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

      <View style={rulesScreenStyles.footerContainer}>
        <TouchableOpacity
          style={rulesScreenStyles.footerButton}
          onPress={handleOpenCreate}
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
