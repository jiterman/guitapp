import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney } from '../../utils/currencyFormatter';

const { width: screenWidth } = Dimensions.get('window');

interface StatsCardProps {
  income: number;
  expense: number;
  variant?: 'default' | 'monthly';
}

const formatCurrency = (value: number) => `$${formatMoney(value)}`;

const StatsCard: React.FC<StatsCardProps> = ({ income, expense, variant = 'default' }) => {
  const balance = income - expense;
  const balancePositive = balance >= 0;
  const isMonthly = variant === 'monthly';

  return (
    <View style={styles.statsCard}>
      <View style={styles.leftCol}>
        {isMonthly && (
          <View
            style={[
              styles.balanceIconCircle,
              { backgroundColor: balancePositive ? '#E8F8EE' : '#FFEDED' },
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={22}
              color={balancePositive ? '#1a9e5c' : '#c0392b'}
            />
          </View>
        )}
        <Text style={styles.balanceLabel}>{isMonthly ? 'Ahorro del mes' : 'Balance'}</Text>
        <Text
          style={[styles.balanceValue, { color: balancePositive ? '#1a9e5c' : '#c0392b' }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {balance < 0 ? '-' : ''}
          {formatCurrency(Math.abs(balance))}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.rightCol}>
        <View style={styles.rightRow}>
          <Text style={styles.incomeLabelText}>Ingresos</Text>
          <Text style={styles.incomeValue}>{formatCurrency(income)}</Text>
        </View>
        <View style={styles.rightSeparator} />
        <View style={styles.rightRow}>
          <Text style={styles.expenseLabelText}>Gastos</Text>
          <Text style={styles.expenseValue}>{formatCurrency(expense)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: screenWidth * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  balanceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#003366',
  },
  balanceValue: {
    fontSize: 27,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#EEF6FB',
    marginHorizontal: screenWidth * 0.04,
  },
  rightCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  rightRow: {
    gap: 2,
  },
  rightSeparator: {
    height: 1,
    width: '100%',
    backgroundColor: '#EEF6FB',
  },
  incomeLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a9e5c',
  },
  incomeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a9e5c',
  },
  expenseLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c0392b',
  },
  expenseValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c0392b',
  },
});

export default StatsCard;
