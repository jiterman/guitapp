import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { CategoryRuleResponse } from '../../../../services/ruleService';
import { EXPENSE_CATEGORIES } from '../../../../constants/categories';

interface CategoryRuleCardProps {
  rule: CategoryRuleResponse;
  onPress: (rule: CategoryRuleResponse) => void;
}

export const CategoryRuleCard: React.FC<CategoryRuleCardProps> = ({ rule, onPress }) => {
  const isFixed = rule.type === 'FIXED';
  const matchedCategory = EXPENSE_CATEGORIES.find(c => c.value === rule.category);
  const categoryLabel = matchedCategory?.label || rule.category;
  const categoryIcon = (matchedCategory as any)?.icon || 'bookmark-outline';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(rule)} activeOpacity={0.7}>
      <View style={styles.leftContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isFixed ? 'rgba(35,131,242,0.1)' : 'rgba(138,79,255,0.1)' },
          ]}
        >
          <Ionicons name={categoryIcon} size={20} color={isFixed ? '#2383F2' : '#8A4FFF'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle} numberOfLines={1} ellipsizeMode="tail">
            {categoryLabel}
          </Text>
          <Text appearance="hint" style={styles.subtitle}>
            Gasto predeterminado
          </Text>
        </View>
      </View>

      <View style={[styles.badge, isFixed ? styles.badgeFixed : styles.badgeVariable]}>
        <Text
          style={[styles.badgeText, isFixed ? styles.badgeTextFixed : styles.badgeTextVariable]}
        >
          {isFixed ? 'Fijo' : 'Variable'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#003366',
  },
  subtitle: {
    fontSize: 12,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeFixed: { backgroundColor: 'rgba(35,131,242,0.15)' },
  badgeVariable: { backgroundColor: 'rgba(138,79,255,0.15)' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextFixed: { color: '#2383F2' },
  badgeTextVariable: { color: '#8A4FFF' },
});
