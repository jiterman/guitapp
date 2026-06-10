import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useModal } from '../hooks/Profile/useModal';
import {
  CategoryRuleCard,
  CategoryRuleResponse,
} from '../components/CategoryRuleCard/CategoryRuleCard';
import { CategoryRuleModal } from '../components/CategoryRuleModal/CategoryRuleModal';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { rulesScreenStyles } from '../styles/rulesStyles';

export default function CategoryRulesScreen() {
  // TODO: Traer reglas del usuario desde el backend
  const [rules, setRules] = useState<CategoryRuleResponse[]>([
    { id: '1', categoryName: 'Supermercado', categoryId: 'SUPERMARKET', expenseType: 'VARIABLE' },
    { id: '2', categoryName: 'Alquiler', categoryId: 'RENT', expenseType: 'FIXED' },
  ]);

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
        setRules(prev =>
          prev.map(r => (r.id === selectedRule.id ? { ...r, expenseType: type } : r))
        );
      } else {
        const matchedCat = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
        const newRule: CategoryRuleResponse = {
          id: Math.random().toString(),
          categoryName: matchedCat?.label || 'Categoría',
          categoryId: categoryValue,
          expenseType: type,
        };
        setRules(prev => [newRule, ...prev]);
      }
      ruleModal.close();
    } catch (e) {
      console.error(e);
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
        keyExtractor={item => item.id}
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
