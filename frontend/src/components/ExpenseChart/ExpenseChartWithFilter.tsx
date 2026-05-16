import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@ui-kitten/components';
import ExpenseChart from './ExpenseChart';
import MovementFilter, { FilterState, FilterKind } from '../MovementFilter/MovementFilter';
import {
  expenseStatisticsService,
  PeriodType,
  ExpenseStatisticsResponse,
} from '../../services/expenseStatisticsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const mapFilterKindToPeriod = (kind: FilterKind): PeriodType => {
  switch (kind) {
    case 'day':
      return 'daily';
    case 'month':
      return 'monthly';
    case 'year':
    case 'all':
      return 'all';
  }
};

const ExpenseChartWithFilter: React.FC = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    kind: 'month',
    day: new Date(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    movementType: 'expense',
  });
  const [data, setData] = useState<ExpenseStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const period = mapFilterKindToPeriod(filterState.kind);
      const statistics = await expenseStatisticsService.getExpenseStatistics(period);
      setData(statistics);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [filterState.kind]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View style={styles.container}>
      <View style={styles.paddedContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Gastos por categoría</Text>
        </View>

        <MovementFilter onChange={setFilterState} initialKind="month" hideMovementTypeFilter />
      </View>

      {loading && (
        <View style={[styles.loadingContainer, styles.paddedContent]}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorContainer, styles.paddedContent]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && data && (
        <ExpenseChart data={data.categories} totalAmount={data.totalAmount} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: vh * 2,
  },
  paddedContent: {
    paddingHorizontal: screenWidth * 0.05,
  },
  header: {
    marginBottom: vh * 1.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: vh * 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b8aa1',
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: vh * 2,
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
  },
});

export default ExpenseChartWithFilter;
