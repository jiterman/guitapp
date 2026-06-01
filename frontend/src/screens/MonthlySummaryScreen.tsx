import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import StatsCard from '../components/StatsCard/StatsCard';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { MonthlySummaryResponse, monthlySummaryService } from '../services/monthlySummaryService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const MONTH_NAMES = [
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

const formatCurrency = (value: number) =>
  `$${new Intl.NumberFormat('es-AR').format(Math.round(value))}`;

const getCategoryLabel = (categoryValue: string): string => {
  const found = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
  return found?.label ?? categoryValue;
};

const getCategoryIcon = (categoryValue: string): string => {
  const found = EXPENSE_CATEGORIES.find(c => c.value === categoryValue);
  return found?.icon ?? 'cube-outline';
};

const getPreviousMonth = () => {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { year: prev.getFullYear(), month: prev.getMonth() + 1 };
};

const INSIGHT_ICON: Record<string, string> = {
  EXPENSES_VS_PREV_MONTH: 'bar-chart-outline',
  SAVINGS: 'wallet-outline',
  TOP_CATEGORY: 'trophy-outline',
  CATEGORY_CHANGE: 'trending-up-outline',
};

const VARIANT_STYLE: Record<string, { color: string; bg: string }> = {
  positive: { color: '#1a9e5c', bg: 'rgba(26,158,92,0.12)' },
  negative: { color: '#c0392b', bg: 'rgba(192,57,43,0.12)' },
  neutral: { color: '#07a3e4', bg: 'rgba(7,163,228,0.12)' },
};

interface InsightCardProps {
  type: string;
  label: string;
  highlight: string;
  sub: string;
  variant: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ type, label, highlight, sub, variant }) => {
  const { color, bg } = VARIANT_STYLE[variant] ?? VARIANT_STYLE.neutral;
  const iconName = INSIGHT_ICON[type] ?? 'information-circle-outline';
  return (
    <View style={styles.insightCard}>
      <View style={[styles.insightIconCircle, { backgroundColor: bg }]}>
        <Ionicons name={iconName as never} size={22} color={color} />
      </View>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={[styles.insightValue, { color }]}>{highlight}</Text>
      <Text style={[styles.insightSub, { color }]}>{sub}</Text>
    </View>
  );
};

const MonthlySummaryScreen: React.FC = () => {
  const defaultPeriod = getPreviousMonth();
  const [year, setYear] = useState(defaultPeriod.year);
  const [month, setMonth] = useState(defaultPeriod.month);
  const [summary, setSummary] = useState<MonthlySummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await monthlySummaryService.getMonthlySummary(y, m);
      setSummary(data);
    } catch {
      setError('No se pudo cargar el resumen mensual.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(year, month);
  }, [year, month, fetchSummary]);

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(y => y - 1);
      setMonth(12);
    } else {
      setMonth(m => m - 1);
    }
  };

  const isLastCompletedMonth = () => {
    const prev = getPreviousMonth();
    return year === prev.year && month === prev.month;
  };

  const goToNextMonth = () => {
    if (isLastCompletedMonth()) return;
    if (month === 12) {
      setYear(y => y + 1);
      setMonth(1);
    } else {
      setMonth(m => m + 1);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.monthSelector}>
        <View style={styles.monthSelectorInner}>
          <Ionicons
            name="chevron-back"
            size={18}
            color="#07a3e4"
            onPress={goToPrevMonth}
            style={styles.chevron}
          />
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[month - 1]} {year}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isLastCompletedMonth() ? '#ccc' : '#07a3e4'}
            onPress={goToNextMonth}
            style={styles.chevron}
          />
        </View>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#07a3e4" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color="#c0392b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && summary && (
        <>
          <View style={styles.statsCardWrapper}>
            <StatsCard income={summary.totalIncome} expense={summary.totalExpenses} />
          </View>

          {summary.insights.length > 0 && (
            <View style={styles.section}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.insightsScroll}
                contentContainerStyle={styles.insightsList}
              >
                {summary.insights.map((insight, idx) => (
                  <InsightCard
                    key={idx}
                    type={insight.type}
                    label={insight.label}
                    highlight={insight.highlight}
                    sub={insight.sub}
                    variant={insight.variant}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {summary.categoryBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gastos por categoría</Text>
              <View style={styles.categoryList}>
                {summary.categoryBreakdown.map(item => (
                  <View key={item.category} style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View style={styles.categoryIconContainer}>
                        <Ionicons
                          name={getCategoryIcon(item.category) as never}
                          size={20}
                          color="#07a3e4"
                        />
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{getCategoryLabel(item.category)}</Text>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${Math.min(item.percentage, 100)}%` },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>{formatCurrency(item.totalAmount)}</Text>
                      <Text style={styles.categoryPct}>{item.percentage.toFixed(1)}%</Text>
                      {item.changeVsPreviousMonth !== null && (
                        <View
                          style={[
                            styles.changeBadge,
                            {
                              backgroundColor:
                                item.changeVsPreviousMonth >= 0
                                  ? 'rgba(192,57,43,0.1)'
                                  : 'rgba(26,158,92,0.1)',
                            },
                          ]}
                        >
                          <Ionicons
                            name={item.changeVsPreviousMonth >= 0 ? 'trending-up' : 'trending-down'}
                            size={12}
                            color={item.changeVsPreviousMonth >= 0 ? '#c0392b' : '#1a9e5c'}
                          />
                          <Text
                            style={[
                              styles.changeText,
                              {
                                color: item.changeVsPreviousMonth >= 0 ? '#c0392b' : '#1a9e5c',
                              },
                            ]}
                          >
                            {Math.abs(item.changeVsPreviousMonth).toFixed(0)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {summary.categoryBreakdown.length === 0 && summary.insights.length === 0 && (
            <View style={styles.centered}>
              <Ionicons name="calendar-outline" size={48} color="#07a3e4" />
              <Text style={styles.emptyText}>No hay datos registrados para este mes.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    marginHorizontal: -(screenWidth * 0.05),
  },
  contentContainer: {
    paddingHorizontal: screenWidth * 0.05,
  },
  monthSelector: {
    marginBottom: vh * 1.5,
  },
  monthSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: screenWidth * 0.04,
    gap: screenWidth * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  chevron: {
    padding: 2,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    flex: 1,
    textAlign: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vh * 5,
    gap: vh * 1.5,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: '#006699',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: screenWidth * 0.1,
  },
  statsCardWrapper: {
    marginBottom: vh * 2.5,
  },
  section: {
    marginBottom: vh * 2.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: vh * 1.2,
  },
  insightsScroll: {
    marginHorizontal: -(screenWidth * 0.05),
  },
  insightsList: {
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: screenWidth * 0.05,
  },
  insightCard: {
    width: screenWidth * 0.38,
    borderRadius: 14,
    padding: screenWidth * 0.04,
    gap: 6,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  insightIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  insightLabel: {
    fontSize: 12,
    color: '#6b8aa1',
    fontWeight: '500',
    lineHeight: 16,
  },
  insightValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  insightSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  categoryList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: vh * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: vh * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6FB',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  categoryIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F2FC',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  categoryInfo: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003366',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#EEF6FB',
    borderRadius: 2,
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#07a3e4',
    borderRadius: 2,
  },
  categoryRight: {
    alignItems: 'flex-end',
    gap: 2,
    marginLeft: 8,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#003366',
  },
  categoryPct: {
    fontSize: 11,
    color: '#6b8aa1',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
    marginTop: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MonthlySummaryScreen;
