import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { MovementResponse } from '../../services/movementService';
import { getCategoryLabel, getCategoryOption } from '../../constants/categories';
import { formatDate } from '../../utils/dateFormatter';

interface Props {
  movement: MovementResponse;
  onPress?: (movement: MovementResponse) => void;
}

const TransactionCard: React.FC<Props> = ({ movement, onPress }) => {
  const Container = onPress ? TouchableOpacity : View;
  const displayText =
    movement.title?.trim() ||
    (movement.category ? getCategoryLabel(movement.category, movement.type) : 'Sin categoría');

  const categoryOption = movement.category
    ? getCategoryOption(movement.category, movement.type)
    : null;
  const iconName = (categoryOption?.icon ??
    (movement.type === 'INCOME'
      ? 'trending-up'
      : 'trending-down')) as keyof typeof Ionicons.glyphMap;

  return (
    <Container style={styles.row} onPress={onPress ? () => onPress(movement) : undefined}>
      <View style={styles.left}>
        <View
          style={[
            styles.iconCircle,
            movement.type === 'INCOME' ? styles.incomeBg : styles.expenseBg,
          ]}
        >
          <Ionicons
            name={iconName}
            size={22}
            color={movement.type === 'INCOME' ? '#1a9e5c' : '#c0392b'}
          />
        </View>
        <View>
          <Text category="s1">{displayText}</Text>
          <Text appearance="hint" category="c1">
            {formatDate(movement.date)}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        {movement.type === 'EXPENSE' && movement.expenseType === 'FIXED' && (
          <View style={[styles.badge, styles.badgeFixed]}>
            <Text style={[styles.badgeText, styles.badgeTextFixed]}>FIJO</Text>
          </View>
        )}
        {movement.type === 'EXPENSE' && movement.expenseType === 'VARIABLE' && (
          <View style={[styles.badge, styles.badgeVariable]}>
            <Text style={[styles.badgeText, styles.badgeTextVariable]}>VAR.</Text>
          </View>
        )}
        <Text style={movement.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount}>
          {movement.type === 'INCOME' ? '+' : '-'}$
          {new Intl.NumberFormat('es-AR').format(Number(movement.amount))}
        </Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeBg: { backgroundColor: 'rgba(26,158,92,0.08)' },
  expenseBg: { backgroundColor: 'rgba(192,57,43,0.08)' },
  right: {
    alignItems: 'flex-end',
  },
  badge: {
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeFixed: {
    backgroundColor: 'rgba(192,57,43,0.10)',
    borderColor: 'rgba(192,57,43,0.25)',
  },
  badgeVariable: {
    backgroundColor: 'rgba(245,166,35,0.14)',
    borderColor: 'rgba(245,166,35,0.35)',
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  badgeTextFixed: {
    color: '#c0392b',
  },
  badgeTextVariable: {
    color: '#b8860b',
  },
  incomeAmount: { color: '#1a9e5c', fontWeight: '700' },
  expenseAmount: { color: '#c0392b', fontWeight: '700' },
});

export default TransactionCard;
