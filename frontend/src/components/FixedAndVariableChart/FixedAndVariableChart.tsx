import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { FixedAndVariableStatisticsResponse } from '../../services/expenseStatisticsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const FIXED_COLOR = '#FFBB00';
const VARIABLE_COLOR = '#07a3e4';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR').format(value);

interface TargetValues {
  fixed: number;
  variable: number;
  savings: number;
}

interface FixedAndVariableChartProps {
  data: FixedAndVariableStatisticsResponse;
  targets?: TargetValues | null;
  isTargetsLoading?: boolean;
}

const buildDeltaLabel = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const FixedAndVariableChart: React.FC<FixedAndVariableChartProps> = ({
  data,
  targets,
  isTargetsLoading = false,
}) => {
  const totalAmount = Number(data.totalAmount ?? 0);
  const fixedAmount = Number(data.fixedAmount ?? 0);
  const variableAmount = Number(data.variableAmount ?? 0);
  const fixedPercentage = Number(data.fixedPercentage ?? 0);
  const variablePercentage = Number(data.variablePercentage ?? 0);

  const hasData = totalAmount > 0;
  const hasTargets = Boolean(targets) && !isTargetsLoading;

  const fixedDelta = hasTargets ? fixedPercentage - targets!.fixed : 0;
  const variableDelta = hasTargets ? variablePercentage - targets!.variable : 0;

  const chartData = [
    { value: fixedAmount, color: FIXED_COLOR, text: `${fixedPercentage.toFixed(0)}%` },
    { value: variableAmount, color: VARIABLE_COLOR, text: `${variablePercentage.toFixed(0)}%` },
  ];

  const chartRadius = screenWidth * 0.32;
  const innerRadius = screenWidth * 0.18;

  const targetStatusLabel = isTargetsLoading
    ? 'Cargando objetivos...'
    : 'Objetivos no disponibles';

  const legendItems = [
    {
      key: 'fixed',
      label: 'Fijos',
      color: FIXED_COLOR,
      amount: fixedAmount,
      percentage: fixedPercentage,
      delta: fixedDelta,
    },
    {
      key: 'variable',
      label: 'Variables',
      color: VARIABLE_COLOR,
      amount: variableAmount,
      percentage: variablePercentage,
      delta: variableDelta,
    },
  ];

  return (
    <>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Fijos vs. variables</Text>
          <Text style={styles.chartSubtitle}>Distribucion de gastos</Text>
        </View>

        {!hasData ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="swap-horizontal-outline" size={48} color={VARIABLE_COLOR} />
            </View>
            <Text style={styles.emptyText}>No hay gastos para mostrar</Text>
            <Text style={styles.emptySubText}>Agrega gastos para comparar fijos y variables</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartContainer}>
              <PieChart
                data={chartData}
                radius={chartRadius}
                innerRadius={innerRadius}
                donut
                focusOnPress
                extraRadius={10}
                sectionAutoFocus
                centerLabelComponent={() => (
                  <View style={styles.centerInfo}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>${formatCurrency(totalAmount)}</Text>
                  </View>
                )}
                showText={false}
                strokeWidth={2}
                strokeColor="#fff"
                innerCircleColor="#fff"
              />
            </View>

            <View style={styles.legendContainer}>
              {legendItems.map(item => {
                const isPositive = item.delta > 0;
                const isNegative = item.delta < 0;
                const deltaColor = isPositive
                  ? '#d35400'
                  : isNegative
                  ? '#1a9e5c'
                  : '#6b8aa1';
                const deltaIcon = isPositive
                  ? 'arrow-up'
                  : isNegative
                  ? 'arrow-down'
                  : 'remove';

                return (
                  <View key={item.key} style={styles.legendItem}>
                    <View style={styles.legendHeader}>
                      <View style={styles.legendLeft}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <Text style={styles.legendLabel}>{item.label}</Text>
                      </View>
                      <View style={styles.legendRight}>
                        <Text style={styles.legendAmount}>${formatCurrency(item.amount)}</Text>
                        <Text style={styles.legendPercentage}>{item.percentage.toFixed(1)}%</Text>
                      </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(item.percentage, 100)}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>

                    {hasTargets ? (
                      <View style={[styles.deltaBadge, { borderColor: deltaColor }]}>
                        <Ionicons name={deltaIcon} size={14} color={deltaColor} />
                        <Text style={[styles.deltaText, { color: deltaColor }]}>
                          Desvio {buildDeltaLabel(item.delta)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.deltaPlaceholder}>{targetStatusLabel}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>

      <View style={styles.targetsCard}>
        <Text style={styles.targetsTitle}>Objetivos del usuario</Text>
        {isTargetsLoading && <Text style={styles.targetsPlaceholder}>{targetStatusLabel}</Text>}
        {!isTargetsLoading && !targets && (
          <Text style={styles.targetsPlaceholder}>{targetStatusLabel}</Text>
        )}
        {targets && !isTargetsLoading && (
          <View style={styles.targetsRow}>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Fijos</Text>
              <Text style={styles.targetValue}>{targets.fixed}%</Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Variables</Text>
              <Text style={styles.targetValue}>{targets.variable}%</Text>
            </View>
            <View style={styles.targetItem}>
              <Text style={styles.targetLabel}>Ahorro</Text>
              <Text style={styles.targetValue}>{targets.savings}%</Text>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 2,
    marginHorizontal: screenWidth * 0.05,
    marginBottom: vh * 2,
    shadowColor: '#3a9fc0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'visible',
  },
  chartHeader: {
    marginBottom: vh * 1.5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6b8aa1',
    marginTop: 2,
  },
  chartContainer: {
    alignItems: 'center',
    paddingBottom: vh,
    paddingHorizontal: 10,
    overflow: 'visible',
  },
  centerInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b8aa1',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003366',
  },
  legendContainer: {
    marginTop: vh * 1.5,
  },
  legendItem: {
    paddingVertical: vh * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6FB',
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendLabel: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '600',
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003366',
  },
  legendPercentage: {
    fontSize: 12,
    color: '#6b8aa1',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F5F8FA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  deltaBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deltaPlaceholder: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b8aa1',
  },
  emptyContainer: {
    padding: vh * 3,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F2FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6b8aa1',
    textAlign: 'center',
  },
  targetsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 2,
    marginHorizontal: screenWidth * 0.05,
    marginBottom: vh * 2,
    shadowColor: '#3a9fc0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  targetsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
    marginBottom: vh,
  },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  targetItem: {
    flex: 1,
    paddingVertical: vh,
    borderRadius: 10,
    backgroundColor: '#F7FAFD',
    borderWidth: 1,
    borderColor: '#E3EDF6',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 12,
    color: '#6b8aa1',
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },
  targetsPlaceholder: {
    fontSize: 12,
    color: '#6b8aa1',
  },
});

export default FixedAndVariableChart;
