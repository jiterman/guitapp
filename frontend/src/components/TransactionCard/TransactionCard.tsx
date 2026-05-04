import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { MovementResponse } from '../../services/movementService';

interface Props {
  movement: MovementResponse;
}

const TransactionCard: React.FC<Props> = ({ movement }) => {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.iconCircle, movement.type === 'INCOME' ? styles.incomeBg : styles.expenseBg]}>
          <Ionicons
            name={movement.type === 'INCOME' ? 'trending-up' : 'trending-down'}
            size={18}
            color={movement.type === 'INCOME' ? '#1a9e5c' : '#c0392b'}
          />
        </View>
        <View>
          <Text category="s1">{movement.description ?? movement.category}</Text>
          <Text appearance="hint" category="c1">{new Date(movement.date).toLocaleString()}</Text>
        </View>
      </View>
      <View>
        <Text style={movement.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount}>
          {movement.type === 'INCOME' ? '+' : '-'}${movement.amount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  incomeBg: { backgroundColor: 'rgba(26,158,92,0.08)' },
  expenseBg: { backgroundColor: 'rgba(192,57,43,0.08)' },
  incomeAmount: { color: '#1a9e5c', fontWeight: '700' },
  expenseAmount: { color: '#c0392b', fontWeight: '700' },
});

export default TransactionCard;
