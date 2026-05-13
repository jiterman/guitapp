import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { movementService, MovementResponse } from '../services/movementService';
import MovementFilter, { FilterState } from '../components/MovementFilter/MovementFilter';
import TransactionCard from '../components/TransactionCard/TransactionCard';
import BalanceCard from '../components/BalanceCard/BalanceCard';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

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

const formatMonthLabel = (year: number, month: number) => {
  const label = new Date(year, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${year}`;
};

const formatDayLabel = (date: Date) => {
  const day = date.getDate();
  const monthLabel = date.toLocaleString('es-ES', { month: 'long' });
  const month = `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}`;
  return `${day} de ${month} del ${date.getFullYear()}`;
};

const buildBalanceTitle = (filterState: FilterState) => {
  if (filterState.kind === 'all') return 'Balance total';
  if (filterState.kind === 'day') {
    return `Balance del ${formatDayLabel(filterState.day)}`;
  }
  if (filterState.kind === 'month') {
    return `Balance de ${formatMonthLabel(filterState.year, filterState.month)}`;
  }
  return `Balance del año ${filterState.year}`;
};

const SummaryScreen: React.FC = () => {
  const [movements, setMovements] = useState<MovementResponse[]>([]);
  const [periodMovements, setPeriodMovements] = useState<MovementResponse[]>([]);
  const [filterState, setFilterState] = useState<FilterState>(() => buildInitialFilter());
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
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
  }, [filterState, isFocused]);

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

  const balanceTitle = useMemo(() => buildBalanceTitle(filterState), [filterState]);

  return (
    <Layout style={styles.container}>
      <Text category="h6" style={styles.title}>
        Resumen
      </Text>

      <MovementFilter onChange={setFilterState} initialKind="month" />

      <BalanceCard title={balanceTitle} income={totals.income} expense={totals.expense} />

      <Text style={styles.sectionTitle}>Movimientos</Text>
      <FlatList
        style={styles.movementsList}
        data={movements}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionCard
            movement={item}
            onPress={movement => {
              if (movement.type !== 'INCOME') return;
              router.push({ pathname: '/income/[incomeId]', params: { incomeId: movement.id } });
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
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
    backgroundColor: '#E6F2FC',
  },
  title: {
    marginBottom: vh * 1.2,
    color: '#003366',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
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
