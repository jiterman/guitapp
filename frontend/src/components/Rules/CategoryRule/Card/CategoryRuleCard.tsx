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
        <View style={[styles.iconContainer, { backgroundColor: isFixed ? '#f4e8ff' : '#e8f8f0' }]}>
          <Ionicons name={categoryIcon} size={20} color={isFixed ? '#8e44ad' : '#27ae60'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle} numberOfLines={1} ellipsizeMode="tail">
            {categoryLabel}
          </Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        <View style={[styles.badge, isFixed ? styles.badgeFixed : styles.badgeVariable]}>
          <Text
            style={[styles.badgeText, isFixed ? styles.badgeTextFixed : styles.badgeTextVariable]}
          >
            {isFixed ? 'Fijo' : 'Variable'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#a6b9c7" />
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
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeFixed: {
    backgroundColor: '#f4e8ff',
    borderColor: 'rgba(142,68,173,0.25)',
  },
  badgeVariable: {
    backgroundColor: '#e8f8f0',
    borderColor: 'rgba(39,174,96,0.30)',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextFixed: { color: '#8e44ad' },
  badgeTextVariable: { color: '#27ae60' },
});
