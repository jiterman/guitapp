import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import FILTER_ICON from '../../../assets/icons/filterIcon';
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

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const getFilterLabel = (filterState: FilterState): string => {
  switch (filterState.kind) {
    case 'day':
      if (filterState.day) {
        const day = filterState.day.getDate().toString().padStart(2, '0');
        const month = (filterState.day.getMonth() + 1).toString().padStart(2, '0');
        const year = filterState.day.getFullYear();
        return `Día · ${day}/${month}/${year}`;
      }
      return 'Día';
    case 'month':
      const monthName = MONTH_LABELS[filterState.month - 1];
      return `Mes · ${monthName} ${filterState.year}`;
    case 'year':
      return `Año · ${filterState.year}`;
    case 'all':
      return 'Desde el inicio';
  }
};

type ChartType = 'categories' | 'timeline';

const ExpenseChartWithFilter: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('categories');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
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

      const params: {
        period: PeriodType;
        year?: number;
        month?: number;
        day?: number;
      } = { period };

      if (filterState.kind === 'day' && filterState.day) {
        params.year = filterState.day.getFullYear();
        params.month = filterState.day.getMonth() + 1;
        params.day = filterState.day.getDate();
      } else if (filterState.kind === 'month') {
        params.year = filterState.year;
        params.month = filterState.month;
      }

      const statistics = await expenseStatisticsService.getExpenseStatistics(params);
      setData(statistics);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [filterState.kind, filterState.day, filterState.month, filterState.year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View style={styles.container}>
      <View style={styles.paddedContent}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Estadísticas</Text>
            <Text style={styles.subtitle}>{getFilterLabel(filterState)}</Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterVisible(!isFilterVisible)}
          >
            <SvgXml xml={FILTER_ICON} width={18} height={18} />
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        <MovementFilter
          onChange={setFilterState}
          initialKind="month"
          hideMovementTypeFilter
          externalModalVisible={isFilterVisible}
          onExternalModalClose={() => setIsFilterVisible(false)}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartTabs}>
          <TouchableOpacity
            style={styles.chartTabWrapper}
            onPress={() => setSelectedChart('categories')}
          >
            {selectedChart === 'categories' ? (
              <LinearGradient
                colors={['#FFE8A3', '#FFF5CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chartTab}
              >
                <Ionicons name="pie-chart-outline" size={18} color="#d39700" />
                <Text style={styles.chartTabTextActive}>Categorías</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.chartTab, styles.chartTabInactive]}>
                <Ionicons name="pie-chart-outline" size={18} color="#6b8aa1" />
                <Text style={styles.chartTabText}>Categorías</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chartTabWrapper}
            onPress={() => setSelectedChart('timeline')}
          >
            {selectedChart === 'timeline' ? (
              <LinearGradient
                colors={['#FFE8A3', '#FFF5CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chartTab}
              >
                <Ionicons name="swap-horizontal-outline" size={18} color="#d39700" />
                <Text style={styles.chartTabTextActive}>Fijos vs variables</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.chartTab, styles.chartTabInactive]}>
                <Ionicons name="swap-horizontal-outline" size={18} color="#6b8aa1" />
                <Text style={styles.chartTabText}>Fijos vs variables</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
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

      {!loading && !error && data && selectedChart === 'categories' && (
        <ExpenseChart data={data.categories} totalAmount={data.totalAmount} />
      )}

      {!loading && !error && data && selectedChart === 'timeline' && (
        <View style={[styles.paddedContent, styles.comingSoon]}>
          <Text style={styles.comingSoonText}>Próximamente...</Text>
        </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b8aa1',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F8FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E6F1',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003366',
  },
  filterContainer: {
    marginBottom: vh * 2,
  },
  chartTabs: {
    marginBottom: vh * 2,
    overflow: 'visible',
  },
  chartTabWrapper: {
    marginRight: 12,
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E8E8F0',
  },
  chartTabInactive: {
    backgroundColor: '#fff',
  },
  chartTabText: {
    fontSize: 13,
    color: '#6b8aa1',
  },
  chartTabTextActive: {
    fontSize: 13,
    color: '#d39700',
  },
  comingSoon: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6b8aa1',
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
