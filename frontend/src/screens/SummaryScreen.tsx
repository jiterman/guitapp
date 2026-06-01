import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text as RNText,
} from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { movementService, MovementResponse } from '../services/movementService';
import MovementFilter, { FilterState } from '../components/MovementFilter/MovementFilter';
import TransactionCard from '../components/TransactionCard/TransactionCard';
import StatsCard from '../components/StatsCard/StatsCard';
import MonthlySummaryScreen from './MonthlySummaryScreen';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

type Tab = 'movements' | 'monthly';

const buildInitialFilter = (): FilterState => {
  const now = new Date();
  return {
    kind: 'month',
    day: now,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    movementType: 'all',
  };
};

const applyTypeFilter = (data: MovementResponse[], movementType: FilterState['movementType']) => {
  if (movementType === 'income') {
    return data.filter(movement => movement.type === 'INCOME');
  }
  if (movementType === 'expense') {
    return data.filter(movement => movement.type === 'EXPENSE');
  }
  return data;
};

const SummaryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('movements');
  const [movements, setMovements] = useState<MovementResponse[]>([]);
  const [periodMovements, setPeriodMovements] = useState<MovementResponse[]>([]);
  const [filterState, setFilterState] = useState<FilterState>(() => buildInitialFilter());
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused || activeTab !== 'movements') return;
    let mounted = true;
    (async () => {
      try {
        const { kind, day, month, year, movementType } = filterState;
        let data: MovementResponse[] = [];

        if (kind === 'all') {
          data = await movementService.getMovements();
        } else if (kind === 'day') {
          const formattedDay = day.toISOString().slice(0, 10);
          data = await movementService.getMovementsByDay(formattedDay);
        } else if (kind === 'month') {
          data = await movementService.getMovementsByMonth(year, month);
        } else if (kind === 'year') {
          data = await movementService.getMovementsByYear(year);
        }

        if (mounted) {
          setPeriodMovements(data);
          setMovements(applyTypeFilter(data, movementType));
        }
      } catch {
        if (mounted) {
          setPeriodMovements([]);
          setMovements([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filterState, isFocused, activeTab]);

  const totals = useMemo(() => {
    return periodMovements.reduce(
      (acc, movement) => {
        if (movement.type === 'INCOME') acc.income += Number(movement.amount);
        else acc.expense += Number(movement.amount);
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [periodMovements]);

  return (
    <Layout style={[styles.container, activeTab === 'monthly' && styles.containerMonthly]}>
      <Text category="h6" style={styles.title}>
        Resumen
      </Text>

      <View style={styles.chartTabs}>
        <TouchableOpacity style={styles.chartTabWrapper} onPress={() => setActiveTab('movements')}>
          {activeTab === 'movements' ? (
            <View style={[styles.chartTab, styles.chartTabActive]}>
              <Ionicons name="list-outline" size={18} color="#FFBB00" />
              <RNText style={styles.chartTabTextActive}>Movimientos</RNText>
            </View>
          ) : (
            <View style={[styles.chartTab, styles.chartTabInactive]}>
              <Ionicons name="list-outline" size={18} color="#6b8aa1" />
              <RNText style={styles.chartTabText}>Movimientos</RNText>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.chartTabWrapper} onPress={() => setActiveTab('monthly')}>
          {activeTab === 'monthly' ? (
            <View style={[styles.chartTab, styles.chartTabActive]}>
              <Ionicons name="calendar-outline" size={18} color="#FFBB00" />
              <RNText style={styles.chartTabTextActive}>Mensual</RNText>
            </View>
          ) : (
            <View style={[styles.chartTab, styles.chartTabInactive]}>
              <Ionicons name="calendar-outline" size={18} color="#6b8aa1" />
              <RNText style={styles.chartTabText}>Mensual</RNText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'monthly' ? (
        <MonthlySummaryScreen />
      ) : (
        <>
          <MovementFilter onChange={setFilterState} initialKind="month" />

          <StatsCard income={totals.income} expense={totals.expense} />

          <Text style={styles.sectionTitle}>Movimientos</Text>
          <FlatList
            style={styles.movementsList}
            data={movements}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TransactionCard
                movement={item}
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
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text appearance="hint">No hay transacciones para este filtro.</Text>
              </View>
            }
          />
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
    backgroundColor: '#E6F2FC',
  },
  containerMonthly: {
    paddingBottom: 0,
  },
  title: {
    marginBottom: vh * 1.2,
    color: '#003366',
    fontWeight: '700',
  },
  chartTabs: {
    marginBottom: vh * 2,
    flexDirection: 'row',
    gap: 12,
  },
  chartTabWrapper: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 8,
  },
  chartTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E8E8F0',
  },
  chartTabActive: {
    backgroundColor: '#fdf6e7',
    borderWidth: 1.5,
    borderColor: '#FFBB00',
  },
  chartTabInactive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8F0',
  },
  chartTabText: {
    fontSize: 13,
    color: '#6b8aa1',
  },
  chartTabTextActive: {
    fontSize: 13,
    color: '#E8AE1A',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginTop: vh * 2,
    marginBottom: vh * 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEF6FB',
  },
  emptyContainer: {
    paddingVertical: vh * 2,
    alignItems: 'center',
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
    paddingRight: 8,
  },
});

export default SummaryScreen;
