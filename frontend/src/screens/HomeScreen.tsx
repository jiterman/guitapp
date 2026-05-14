import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { movementService, MovementResponse } from '../services/movementService';
import TransactionCard from '../components/TransactionCard/TransactionCard';
import BalanceCard from '../components/BalanceCard/BalanceCard';
import { useIsFocused } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const HomeScreen = () => {
  const [movements, setMovements] = useState<MovementResponse[]>([]);
  const [incomeSum, setIncomeSum] = useState<number>(0);
  const [expenseSum, setExpenseSum] = useState<number>(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    let mounted = true;
    (async () => {
      try {
        const data = await movementService.getMovements();
        if (mounted) setMovements(data);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isFocused]);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const incomesThisMonth = movements
      .filter(m => m.type === 'INCOME')
      .filter(m => {
        const d = new Date(m.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, m) => acc + Number(m.amount), 0);

    const expensesThisMonth = movements
      .filter(m => m.type === 'EXPENSE')
      .filter(m => {
        const d = new Date(m.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, m) => acc + Number(m.amount), 0);

    setIncomeSum(incomesThisMonth);
    setExpenseSum(expensesThisMonth);
  }, [movements]);
  const now = new Date();
  const monthName = now.toLocaleString('es-ES', { month: 'long' });
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${now.getFullYear()}`;

  return (
    <Layout style={styles.container}>
      <BalanceCard title={`Balance de ${monthLabel}`} income={incomeSum} expense={expenseSum} />

      <Text style={styles.sectionTitle}>Acciones</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/add-expense')}
        >
          <Ionicons name="remove-circle-outline" size={40} color="#FFBB00" />
          <Text style={[styles.actionLabel, { color: '#07a3e4' }]}>Gasto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/add-income')}
        >
          <Ionicons name="add-circle-outline" size={40} color="#FFBB00" />
          <Text style={[styles.actionLabel, { color: '#07a3e4' }]}>Ingreso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/summary')}
        >
          <Ionicons name="bar-chart-outline" size={40} color="#FFBB00" />
          <Text style={[styles.actionLabel, { color: '#07a3e4' }]}>Resumen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimos movimientos</Text>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/transactions')}>
          <Text style={styles.seeAllText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={14} color="#07a3e4" />
        </TouchableOpacity>
      </View>
      <View style={styles.movementsContainer}>
        {movements.length === 0 ? (
          <View style={styles.emptyMovements}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="wallet" size={36} color="#07a3e4" />
            </View>
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>Todavía no hay movimientos este mes.</Text>
              <Text style={styles.emptySubText}>
                {'¡Agregá tu primer ingreso o gasto para verlo reflejado acá!'}
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.movementsList} nestedScrollEnabled>
            {movements.map(m => (
              <View key={m.id}>
                <TransactionCard
                  movement={m}
                  onPress={movement => {
                    if (movement.type === 'INCOME') {
                      router.push({
                        pathname: '/income/[incomeId]',
                        params: { incomeId: movement.id },
                      });
                    } else if (movement.type === 'EXPENSE') {
                      router.push({
                        pathname: '/expense/[expenseId]',
                        params: { expenseId: movement.id },
                      });
                    }
                  }}
                />
                <View style={{ height: 1, backgroundColor: '#EEF6FB' }} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    padding: screenWidth * 0.05,
    paddingTop: vh * 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#07a3e4',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: screenWidth * 0.03,
    marginTop: vh * 1.5,
    marginBottom: vh * 3,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: vh * 2,
    alignItems: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonPrimary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#07a3e4',
  },
  actionLabel: {
    fontSize: 15,
    color: '#003366',
    fontWeight: '600',
  },
  emptyMovements: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F2FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextContainer: {
    flex: 1,
  },
  emptyText: {
    color: '#003366',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    color: '#006699',
    fontSize: 13,
  },
  movementsList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: vh * 0.5,
    paddingHorizontal: vh * 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    maxHeight: vh * 28,
    paddingRight: 8,
  },
  movementsContainer: {
    marginBottom: vh * 2,
    paddingBottom: vh * 2,
  },
  movementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh * 1,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6FB',
  },
  movementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  movementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeIconBg: {
    backgroundColor: 'rgba(26,158,92,0.08)',
  },
  expenseIconBg: {
    backgroundColor: 'rgba(192,57,43,0.08)',
  },
  movementDesc: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '600',
  },
  movementDate: {
    fontSize: 12,
    color: '#6b8aa1',
  },
  incomeAmount: {
    color: '#1a9e5c',
    fontWeight: '700',
  },
  expenseAmount: {
    color: '#c0392b',
    fontWeight: '700',
  },
});

export default HomeScreen;
