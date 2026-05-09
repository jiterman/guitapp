import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

interface BalanceCardProps {
  title: string;
  income: number;
  expense: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR').format(value);

const BalanceCard: React.FC<BalanceCardProps> = ({ title, income, expense }) => {
  const total = income - expense;

  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceTop}>
        <View>
          <Text style={styles.balanceLabel}>{title}</Text>
          <Text style={styles.balanceAmount}>${formatCurrency(total)}</Text>
        </View>
        <Ionicons name="sunny" size={56} color="#FFBB00" style={styles.sunIcon} />
      </View>
      <View style={styles.balanceRow}>
        <View style={styles.balanceSubCard}>
          <View style={styles.balanceSubCardInner}>
            <View style={styles.iconCircleGreen}>
              <Ionicons name="trending-up" size={16} color="#1a9e5c" />
            </View>
            <View>
              <Text style={styles.balanceItemLabel}>Ingresos</Text>
              <Text style={styles.incomeText}>${formatCurrency(income)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceSubCard}>
          <View style={styles.balanceSubCardInner}>
            <View style={styles.iconCircleRed}>
              <Ionicons name="trending-down" size={16} color="#c0392b" />
            </View>
            <View>
              <Text style={styles.balanceItemLabel}>Gastos</Text>
              <Text style={styles.expenseText}>${formatCurrency(expense)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#5bbfdd',
    borderRadius: 24,
    marginBottom: vh * 2.5,
    borderTopWidth: 4,
    borderTopColor: '#FFBB00',
    shadowColor: '#3a9fc0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh * 2,
    paddingBottom: vh * 2,
  },
  sunIcon: {
    opacity: 0.95,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: vh * 0.5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: vh * 1.75,
    borderTopWidth: 3,
    borderTopColor: '#FFBB00',
  },
  balanceSubCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  balanceSubCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26,158,92,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(192,57,43,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1.5,
    height: 50,
    backgroundColor: '#FFBB00',
    borderRadius: 1,
  },
  balanceItemLabel: {
    color: '#006699',
    fontSize: 16.5,
    fontWeight: '600',
  },
  incomeText: {
    color: '#1a9e5c',
    fontWeight: 'bold',
    fontSize: 22,
  },
  expenseText: {
    color: '#c0392b',
    fontWeight: 'bold',
    fontSize: 22,
  },
});

export default BalanceCard;
