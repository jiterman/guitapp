import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { movementService, MovementResponse } from '../services/movementService';
import TransactionCard from '../components/TransactionCard/TransactionCard';
import MovementFilter, { FilterState } from '../components/MovementFilter/MovementFilter';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const buildInitialFilter = (): FilterState => {
  const now = new Date();
  return {
    kind: 'all',
    day: now,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    movementType: 'all',
    categories: [],
    expenseType: 'all',
    search: '',
  };
};

const applyClientFilters = (data: MovementResponse[], filter: FilterState) => {
  const { movementType, categories, expenseType, search } = filter;
  const normalizedSearch = search?.trim().toLowerCase() ?? '';

  return data.filter(movement => {
    if (movementType === 'income' && movement.type !== 'INCOME') return false;
    if (movementType === 'expense' && movement.type !== 'EXPENSE') return false;
    const hasCategoryFilter = !!categories && categories.length > 0;
    if (hasCategoryFilter && !(movement.category && categories.includes(movement.category))) {
      return false;
    }
    if (expenseType && expenseType !== 'all' && movement.expenseType !== expenseType) return false;
    if (normalizedSearch && !movement.title?.toLowerCase().includes(normalizedSearch)) return false;
    return true;
  });
};

const TransactionsScreen: React.FC = () => {
  const [movements, setMovements] = useState<MovementResponse[]>([]);
  const [filterState, setFilterState] = useState<FilterState>(() => buildInitialFilter());
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    let mounted = true;
    (async () => {
      try {
        const { kind, day, month, year } = filterState;
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

        if (mounted) setMovements(applyClientFilters(data, filterState));
      } catch {
        if (mounted) setMovements([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filterState, isFocused]);

  const renderItem = ({ item }: { item: MovementResponse }) => (
    <TransactionCard
      movement={item}
      onPress={movement => {
        if (movement.type === 'INCOME') {
          router.push({ pathname: '/income/[incomeId]', params: { incomeId: movement.id } });
        } else if (movement.type === 'EXPENSE') {
          router.push({ pathname: '/expense/[expenseId]', params: { expenseId: movement.id } });
        }
      }}
    />
  );

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Movimientos</Text>
        {movements.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{movements.length}</Text>
          </View>
        )}
      </View>

      <MovementFilter onChange={setFilterState} initialKind="all" showAdvancedFilters />

      {movements.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={36} color="#07a3e4" />
          </View>
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>No hay movimientos</Text>
            <Text style={styles.emptySubText}>
              No encontramos movimientos para este filtro. Probá con otro período.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.listCard}>
          <FlatList
            data={movements}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
    paddingTop: vh * 3,
    backgroundColor: '#E6F2FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: vh * 1.5,
  },
  title: {
    color: '#003366',
    fontWeight: '700',
    fontSize: 22,
  },
  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: '#07a3e4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  listCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: screenWidth * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  listContent: {
    paddingVertical: vh * 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEF6FB',
  },
  emptyCard: {
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
  emptyTitle: {
    color: '#003366',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubText: {
    color: '#006699',
    fontSize: 13,
  },
});

export default TransactionsScreen;
