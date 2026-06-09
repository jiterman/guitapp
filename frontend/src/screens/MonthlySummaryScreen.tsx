import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import StatsCard from '../components/StatsCard/StatsCard';
import CategoryLegend from '../components/CategoryLegend/CategoryLegend';
import HealthScoreCard from '../components/HealthScoreCard/HealthScoreCard';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { MonthlySummaryResponse, monthlySummaryService } from '../services/monthlySummaryService';
import { HealthScoreResponse, healthScoreService } from '../services/healthScoreService';

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
  CATEGORY_INCREASE: 'trending-up-outline',
  CATEGORY_DECREASE: 'trending-down-outline',
  NON_ESSENTIAL_RATIO: 'cart-outline',
  WEEKLY_VARIABLE_CONCENTRATION: 'calendar-outline',
};

const VARIANT_STYLE: Record<string, { color: string; iconBg: string; cardBg: string }> = {
  positive: { color: '#22C55E', iconBg: '#E8F8EE', cardBg: '#F4FCF7' },
  negative: { color: '#EF5350', iconBg: '#FFEDED', cardBg: '#FFF7F7' },
  neutral: { color: '#2196F3', iconBg: '#EAF5FF', cardBg: '#F7FBFF' },
};

const INSIGHT_INFO: Partial<Record<string, string>> = {
  NON_ESSENTIAL_RATIO:
    'Porcentaje del total de tus gastos que corresponde a categorías consideradas no esenciales.\n\nCategorías no esenciales: Restaurantes, Café, Delivery, Suscripciones, Salidas, Gimnasio, Viajes, Ropa, Belleza, Compras y Tecnología.',
};

interface InsightCardProps {
  type: string;
  label: string;
  highlight: string;
  sub: string;
  variant: string;
  category: string | null;
}

const InsightCard: React.FC<InsightCardProps> = ({
  type,
  label,
  highlight,
  sub,
  variant,
  category,
}) => {
  const [infoVisible, setInfoVisible] = useState(false);
  const { color, iconBg, cardBg } = VARIANT_STYLE[variant] ?? VARIANT_STYLE.neutral;
  const iconName = category
    ? getCategoryIcon(category)
    : (INSIGHT_ICON[type] ?? 'information-circle-outline');
  const infoText = INSIGHT_INFO[type];

  return (
    <View style={[styles.insightCard, { backgroundColor: cardBg, borderColor: color }]}>
      {infoText && (
        <TouchableOpacity
          style={styles.insightInfoBtn}
          onPress={() => setInfoVisible(true)}
          hitSlop={8}
        >
          <Ionicons name="information-circle-outline" size={14} color="#7D8EA3" />
        </TouchableOpacity>
      )}
      <View style={[styles.insightIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName as never} size={22} color={color} />
      </View>
      <Text style={[styles.insightLabel, { color }]}>{label}</Text>
      <Text style={[styles.insightValue, { color }]}>{highlight}</Text>
      <Text style={styles.insightSub}>{sub}</Text>

      {infoText && (
        <Modal
          transparent
          animationType="fade"
          visible={infoVisible}
          onRequestClose={() => setInfoVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setInfoVisible(false)}>
            <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setInfoVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={18} color="#7D8EA3" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalBody}>{infoText}</Text>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const MonthlySummaryScreen: React.FC = () => {
  const defaultPeriod = getPreviousMonth();
  const [year, setYear] = useState(defaultPeriod.year);
  const [month, setMonth] = useState(defaultPeriod.month);
  const [summary, setSummary] = useState<MonthlySummaryResponse | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchSummary = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const [data, score] = await Promise.all([
        monthlySummaryService.getMonthlySummary(y, m),
        healthScoreService.getHealthScore(y, m),
      ]);
      setSummary(data);
      setHealthScore(score);
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
          {healthScore && (
            <View style={styles.healthScoreWrapper}>
              <HealthScoreCard data={healthScore} />
            </View>
          )}

          <View style={styles.statsCardWrapper}>
            <StatsCard
              income={summary.totalIncome}
              expense={summary.totalExpenses}
              variant="monthly"
            />
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
                    category={insight.category}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {summary.categoryBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Gastos por categoría <Text style={styles.sectionTitleSub}>(vs mes anterior)</Text>
              </Text>
              <CategoryLegend data={summary.categoryBreakdown} />
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
  healthScoreWrapper: {
    marginBottom: vh * 2,
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
  sectionTitleSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#003366',
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
    width: screenWidth * 0.35,
    borderRadius: 14,
    borderWidth: 1,
    padding: screenWidth * 0.04,
    gap: 6,
    alignItems: 'center',
  },
  insightIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  insightLabel: {
    fontSize: 12,
    color: '#7D8EA3',
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
  insightSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7D8EA3',
    textAlign: 'center',
  },
  insightInfoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.08,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
    flex: 1,
  },
  modalBody: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
  },
});

export default MonthlySummaryScreen;
