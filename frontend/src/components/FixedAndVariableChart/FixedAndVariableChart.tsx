import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SvgXml } from 'react-native-svg';
import { FixedAndVariableStatisticsResponse } from '../../services/expenseStatisticsService';
import FIXED_ICON from '../../../assets/icons/fixedIcon';
import VARIABLE_ICON from '../../../assets/icons/variableIcon';
import SAVINGS_ICON from '../../../assets/icons/savingsIcon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const FIXED_COLOR = '#FFBB00';
const VARIABLE_COLOR = '#07a3e4';
const SAVINGS_COLOR = '#1a9e5c';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR').format(value);

interface TargetValues {
  fixed: number;
  variable: number;
  savings: number;
}

interface FixedAndVariableChartProps {
  data: FixedAndVariableStatisticsResponse;
  earningsAmount: number;
  targets?: TargetValues | null;
  isTargetsLoading?: boolean;
}

type DistributionKind = 'fixed' | 'variable' | 'savings';

type LegendItem = {
  key: DistributionKind;
  label: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
  targetPercentage: number;
  kind: DistributionKind;
};

const buildDeltaLabel = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const buildAdjustmentText = (kind: DistributionKind, deltaAmount: number) => {
  const amountLabel = `$${formatCurrency(Math.abs(deltaAmount))}`;

  if (kind === 'savings') {
    return deltaAmount >= 0 ? `Puedes gastar: ${amountLabel}` : `Debes Ingresar: ${amountLabel}`;
  }

  return deltaAmount > 0 ? `Gastos en exceso: ${amountLabel}` : `Puedes gastar: ${amountLabel}`;
};

const getDeviationColor = (kind: DistributionKind, deltaAmount: number) => {
  if (kind === 'savings') {
    return deltaAmount >= 0 ? '#1a9e5c' : '#c0392b';
  }

  return deltaAmount > 0 ? '#c0392b' : '#1a9e5c';
};

const FixedAndVariableChart: React.FC<FixedAndVariableChartProps> = ({
  data,
  earningsAmount,
  targets,
  isTargetsLoading = false,
}) => {
  const [selectedKey, setSelectedKey] = useState<DistributionKind | null>(null);

  const totalExpenses = Number(data.totalAmount ?? 0);
  const fixedAmount = Number(data.fixedAmount ?? 0);
  const variableAmount = Number(data.variableAmount ?? 0);
  const totalEarnings = Number(earningsAmount ?? 0);

  const rawSavingsAmount = totalEarnings - totalExpenses;
  const savingsAmount = Math.max(rawSavingsAmount, 0);

  const chartTotal = fixedAmount + variableAmount + savingsAmount;
  const distributionTotal = totalEarnings > 0 ? totalEarnings : chartTotal;

  const fixedPercentage = distributionTotal > 0 ? (fixedAmount / distributionTotal) * 100 : 0;
  const variablePercentage = distributionTotal > 0 ? (variableAmount / distributionTotal) * 100 : 0;
  const savingsPercentage = distributionTotal > 0 ? (savingsAmount / distributionTotal) * 100 : 0;

  const hasData = chartTotal > 0;
  const canShowTargets = Boolean(targets) && !isTargetsLoading && totalEarnings > 0;
  const targetStatusLabel = isTargetsLoading
    ? 'Cargando objetivos...'
    : totalEarnings <= 0
    ? 'Ingresos no disponibles'
    : 'Objetivos no disponibles';

  const legendItems: LegendItem[] = [
    {
      key: 'fixed',
      label: 'Fijos',
      color: FIXED_COLOR,
      icon: FIXED_ICON,
      amount: fixedAmount,
      percentage: fixedPercentage,
      targetPercentage: targets?.fixed ?? 0,
      kind: 'fixed',
    },
    {
      key: 'variable',
      label: 'Variables',
      color: VARIABLE_COLOR,
      icon: VARIABLE_ICON,
      amount: variableAmount,
      percentage: variablePercentage,
      targetPercentage: targets?.variable ?? 0,
      kind: 'variable',
    },
    {
      key: 'savings',
      label: 'Ahorro',
      color: SAVINGS_COLOR,
      icon: SAVINGS_ICON,
      amount: savingsAmount,
      percentage: savingsPercentage,
      targetPercentage: targets?.savings ?? 0,
      kind: 'savings',
    },
  ];

  const handleItemPress = (key: DistributionKind) => {
    setSelectedKey(prev => (prev === key ? null : key));
  };

  const chartData = legendItems.map(item => {
    const isSelected = selectedKey === item.key;
    return {
      value: item.amount,
      color: item.color,
      text: `${item.percentage.toFixed(0)}%`,
      focused: isSelected,
      onPress: () => handleItemPress(item.key),
      strokeColor: '#fff',
      strokeWidth: isSelected ? 4 : 2,
    };
  });

  const selectedItem = selectedKey ? legendItems.find(item => item.key === selectedKey) : null;
  const chartRadius = screenWidth * 0.32;
  const innerRadius = screenWidth * 0.18;
  const centerAmount = totalEarnings > 0 ? totalEarnings : totalExpenses;
  const centerLabel = totalEarnings > 0 ? 'Ingresos' : 'Total';
  const displayLabel = selectedItem ? selectedItem.label : centerLabel;
  const displayAmount = selectedItem ? selectedItem.amount : centerAmount;

  return (
    <>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Distribucion de gastos</Text>
        </View>

        {!hasData ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <SvgXml xml={SAVINGS_ICON} width={40} height={40} color={SAVINGS_COLOR} />
            </View>
            <Text style={styles.emptyText}>No hay datos para mostrar</Text>
            <Text style={styles.emptySubText}>Agrega ingresos y gastos para ver el grafico</Text>
          </View>
        ) : (
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
                  {selectedItem && (
                    <View
                      style={[
                        styles.centerIconContainer,
                        {
                          borderColor: selectedItem.color,
                          backgroundColor: `${selectedItem.color}15`,
                        },
                      ]}
                    >
                      <SvgXml
                        xml={selectedItem.icon}
                        width={20}
                        height={20}
                        color={selectedItem.color}
                      />
                    </View>
                  )}
                  <Text style={styles.totalLabel}>{displayLabel}</Text>
                  <Text style={styles.totalAmount}>${formatCurrency(displayAmount)}</Text>
                  {selectedItem && (
                    <Text style={styles.percentageLabel}>
                      {selectedItem.percentage.toFixed(1)}%
                    </Text>
                  )}
                </View>
              )}
              showText={false}
              strokeWidth={2}
              strokeColor="#fff"
              innerCircleColor="#fff"
              innerCircleBorderWidth={selectedItem ? 3 : 0}
              innerCircleBorderColor={selectedItem?.color ?? 'transparent'}
            />
          </View>
        )}
      </View>

      {hasData && (
        <>
          <View style={styles.legendWrapper}>
            <View style={styles.legendContainer}>
              {legendItems.map(item => (
                <View key={item.key} style={styles.legendItem}>
                  <View style={styles.legendHeader}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                        <SvgXml xml={item.icon} width={18} height={18} color={item.color} />
                      </View>
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
                </View>
              ))}
            </View>
          </View>

          <View style={styles.targetsWrapper}>
            <View style={styles.targetsContainer}>
              {canShowTargets ? (
                legendItems.map(item => {
                  const desiredAmount = (totalEarnings * item.targetPercentage) / 100;
                  const deltaPercent = item.percentage - item.targetPercentage;
                  const deltaAmount = item.amount - desiredAmount;
                  const deviationColor = getDeviationColor(item.kind, deltaAmount);
                  const adjustmentText = buildAdjustmentText(item.kind, deltaAmount);

                  return (
                    <View key={item.key} style={styles.targetItem}>
                      <View style={styles.targetHeader}>
                        <View style={styles.targetLeft}>
                          <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                            <SvgXml xml={item.icon} width={18} height={18} color={item.color} />
                          </View>
                          <Text style={styles.targetLabel}>{item.label}</Text>
                        </View>
                        <View style={styles.targetRight}>
                          <Text style={styles.targetObjectiveLabel}>Objetivo</Text>
                          <Text style={styles.targetObjectiveValue}>
                            {item.targetPercentage.toFixed(1)}% · ${formatCurrency(desiredAmount)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.targetDeviationText, { color: deviationColor }]}>
                        Desvio {buildDeltaLabel(deltaPercent)}
                      </Text>
                      <Text style={[styles.targetHintText, { color: deviationColor }]}
                      >
                        {adjustmentText}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.targetPlaceholder}>{targetStatusLabel}</Text>
              )}
            </View>
          </View>
        </>
      )}
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
  centerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  percentageLabel: {
    fontSize: 11,
    color: '#6b8aa1',
    marginTop: 2,
  },
  legendWrapper: {
    paddingHorizontal: screenWidth * 0.05,
    marginTop: vh,
  },
  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: vh * 2,
    paddingTop: vh,
    paddingBottom: vh * 1.75,
    shadowColor: '#3a9fc0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
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
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  targetsWrapper: {
    paddingHorizontal: screenWidth * 0.05,
    marginTop: vh,
  },
  targetsContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: vh * 2,
    paddingTop: vh,
    paddingBottom: vh * 1.75,
    shadowColor: '#3a9fc0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  targetItem: {
    paddingVertical: vh * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6FB',
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  targetLabel: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '600',
  },
  targetRight: {
    alignItems: 'flex-end',
  },
  targetObjectiveLabel: {
    fontSize: 11,
    color: '#6b8aa1',
  },
  targetObjectiveValue: {
    fontSize: 12,
    color: '#003366',
    fontWeight: '600',
  },
  targetDeviationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  targetHintText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  targetPlaceholder: {
    paddingVertical: vh,
    fontSize: 12,
    color: '#6b8aa1',
    textAlign: 'center',
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
});

export default FixedAndVariableChart;
