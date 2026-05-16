import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { MovementResponse } from '../../services/movementService';
import { getCategoryLabel } from '../../constants/categories';

interface Props {
  movement: MovementResponse;
  onPress?: (movement: MovementResponse) => void;
}

const TransactionCard: React.FC<Props> = ({ movement, onPress }) => {
  const Container = onPress ? TouchableOpacity : View;
  const displayText =
    movement.description?.trim() ||
    (movement.category ? getCategoryLabel(movement.category, movement.type) : 'Sin categoría');

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
            name={movement.type === 'INCOME' ? 'trending-up' : 'trending-down'}
            size={18}
            color={movement.type === 'INCOME' ? '#1a9e5c' : '#c0392b'}
          />
        </View>
        <View>
          <Text category="s1">{displayText}</Text>
          <Text appearance="hint" category="c1">
            {new Date(movement.date).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        {movement.type === 'EXPENSE' && movement.expenseType === 'FIXED' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FIJO</Text>
          </View>
        )}
        {movement.type === 'EXPENSE' && movement.expenseType === 'VARIABLE' && (
          <View style={styles.badgeVariable}>
            <Text style={styles.badgeText}>VAR.</Text>
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
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#c0392b',
  },
  badgeVariable: {
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#c0392b',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  incomeAmount: { color: '#1a9e5c', fontWeight: '700' },
  expenseAmount: { color: '#c0392b', fontWeight: '700' },
});

export default TransactionCard;
