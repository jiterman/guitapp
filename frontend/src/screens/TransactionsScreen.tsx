import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { movementService, MovementResponse } from '../services/movementService';
import TransactionCard from '../components/TransactionCard/TransactionCard';
import MovementFilter, { FilterState } from '../components/MovementFilter/MovementFilter';

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

const TransactionsScreen: React.FC = () => {
  const [movements, setMovements] = useState<MovementResponse[]>([]);
  const [filterState, setFilterState] = useState<FilterState>(() => buildInitialFilter());

  useEffect(() => {
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

        if (mounted) setMovements(applyTypeFilter(data, movementType));
      } catch {
        if (mounted) setMovements([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filterState]);

  const renderItem = ({ item }: { item: MovementResponse }) => <TransactionCard movement={item} />;

  return (
    <Layout style={styles.container}>
      <Text category="h6" style={styles.title}>
        Lista de Transacciones
      </Text>

      <MovementFilter onChange={setFilterState} />

      <FlatList
        data={movements}
        keyExtractor={i => i.id}
        renderItem={renderItem}
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
  separator: {
    height: 1,
    backgroundColor: '#EEF6FB',
  },
  emptyContainer: {
    paddingVertical: vh * 2,
    alignItems: 'center',
  },
});

export default TransactionsScreen;
