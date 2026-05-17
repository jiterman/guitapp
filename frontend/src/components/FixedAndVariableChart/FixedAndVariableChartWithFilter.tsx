import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  expenseStatisticsService,
  ExpenseStatisticsParams,
  FixedAndVariableStatisticsResponse,
} from '../../services/expenseStatisticsService';
import FixedAndVariableChart from './FixedAndVariableChart';
import { incomeService } from '../../services/incomeService';
import { useUser } from '../../context/UserContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

interface FixedAndVariableChartWithFilterProps {
  params: ExpenseStatisticsParams;
}

const FixedAndVariableChartWithFilter: React.FC<FixedAndVariableChartWithFilterProps> = ({
  params,
}) => {
  const { user, isLoading: isUserLoading } = useUser();
  const [data, setData] = useState<{
    expenses: FixedAndVariableStatisticsResponse;
    earningsAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [expenseStats, incomeStats] = await Promise.all([
        expenseStatisticsService.getFixedAndVariableStatistics(params),
        incomeService.getIncomeStatistics(params),
      ]);

      setData({
        expenses: expenseStats,
        earningsAmount: Number(incomeStats.totalAmount ?? 0),
      });
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Error al cargar estadisticas');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <FixedAndVariableChart
      data={data.expenses}
      earningsAmount={data.earningsAmount}
      targets={
        user
          ? {
              fixed: user.targetFixedExpenses,
              variable: user.targetVariableExpenses,
              savings: user.targetSavings,
            }
          : null
      }
      isTargetsLoading={isUserLoading}
    />
  );
};

const styles = StyleSheet.create({
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
    marginHorizontal: screenWidth * 0.05,
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
    marginHorizontal: screenWidth * 0.05,
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
  },
});

export default FixedAndVariableChartWithFilter;
