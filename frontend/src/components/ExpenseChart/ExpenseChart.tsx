import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { ExpenseCategoryStatistics } from '../../services/expenseStatisticsService';
import { EXPENSE_CATEGORY_COLORS } from '../../constants/expenseCategories';
import { getCategoryLabel, getCategoryIcon } from '../../constants/categories';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR').format(value);

interface ExpenseChartProps {
  data: ExpenseCategoryStatistics[];
  totalAmount: number;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data, totalAmount }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="pie-chart-outline" size={48} color="#07a3e4" />
        </View>
        <Text style={styles.emptyText}>No hay gastos para mostrar</Text>
        <Text style={styles.emptySubText}>Agregá gastos para ver el gráfico</Text>
      </View>
    );
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(prev => (prev === category ? null : category));
  };

  const chartData = data.map(item => {
    const color = EXPENSE_CATEGORY_COLORS[item.category];
    const isSelected = selectedCategory === item.category;

    return {
      value: Number(item.totalAmount),
      color: color,
      category: item.category,
      focused: isSelected,
      onPress: () => handleCategoryClick(item.category),
      text: `${item.percentage.toFixed(0)}%`,
    };
  });

  const selectedData = selectedCategory
    ? data.find(item => item.category === selectedCategory)
    : null;

  const chartRadius = screenWidth * 0.35;
  const iconSize = 32;
  const iconMargin = 10;
  const wrapperSize = chartRadius * 2 + iconSize + iconMargin * 2;

  const calculateIconPosition = (startAngle: number, angleSize: number) => {
    const midAngle = startAngle + angleSize / 2 - 90;
    const angleInRadians = (midAngle * Math.PI) / 180;

    const iconRadius = chartRadius + iconMargin + iconSize / 2;
    const centerOffset = wrapperSize / 2;

    const iconX = centerOffset + iconRadius * Math.cos(angleInRadians);
    const iconY = centerOffset + iconRadius * Math.sin(angleInRadians);

    return { iconX, iconY };
  };

  const MIN_PERCENTAGE_FOR_LABEL = 5;

  let cumulativeAngle = 0;
  const labelsData = data
    .map(item => {
      const angleSize = (Number(item.totalAmount) / totalAmount) * 360;
      const shouldShowLabel = item.percentage >= MIN_PERCENTAGE_FOR_LABEL;
      const position = calculateIconPosition(cumulativeAngle, angleSize);
      cumulativeAngle += angleSize;

      return shouldShowLabel
        ? {
            ...position,
            icon: getCategoryIcon(item.category),
            color: EXPENSE_CATEGORY_COLORS[item.category],
            category: item.category,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={[styles.chartWrapper, { width: wrapperSize, height: wrapperSize }]}>
          <View style={styles.chartInner} pointerEvents="box-none">
            <PieChart
              data={chartData}
              radius={chartRadius}
              innerRadius={screenWidth * 0.2}
              donut
              focusOnPress
              extraRadius={8}
              centerLabelComponent={() => (
                <View style={styles.centerInfo}>
                  <Text style={styles.totalLabel}>
                    {selectedData ? getCategoryLabel(selectedData.category, 'EXPENSE') : 'Total'}
                  </Text>
                  <Text style={styles.totalAmount}>
                    ${formatCurrency(selectedData ? Number(selectedData.totalAmount) : totalAmount)}
                  </Text>
                  {selectedData && (
                    <Text style={styles.percentageLabel}>
                      {selectedData.percentage.toFixed(1)}%
                    </Text>
                  )}
                </View>
              )}
              showText={false}
              strokeWidth={2}
              strokeColor="#fff"
            />
          </View>

          {labelsData.map((labelData, index) => {
            const iconName = labelData.icon as keyof typeof Ionicons.glyphMap;
            const iconX = labelData.iconX - iconSize / 2;
            const iconY = labelData.iconY - iconSize / 2;
            const isSelected = selectedCategory === labelData.category;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.iconLabel,
                  {
                    left: iconX,
                    top: iconY,
                    width: iconSize,
                    height: iconSize,
                    borderRadius: iconSize / 2,
                    backgroundColor: isSelected ? labelData.color : '#fff',
                    borderWidth: 2,
                    borderColor: labelData.color,
                  },
                ]}
                onPress={() => handleCategoryClick(labelData.category)}
                activeOpacity={0.7}
              >
                <Ionicons name={iconName} size={18} color={isSelected ? '#fff' : labelData.color} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.legendWrapper}>
        <View style={styles.legendContainer}>
          {data.map((item, index) => {
            const color = EXPENSE_CATEGORY_COLORS[item.category];
            const label = getCategoryLabel(item.category, 'EXPENSE');
            const iconName = getCategoryIcon(item.category) as keyof typeof Ionicons.glyphMap;
            return (
              <View key={index} style={styles.legendItem}>
                <View style={styles.legendLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={iconName} size={18} color={color} />
                  </View>
                  <Text style={styles.legendLabel}>{label}</Text>
                </View>
                <View style={styles.legendRight}>
                  <Text style={styles.legendPercentage}>{item.percentage.toFixed(1)}%</Text>
                  <Text style={styles.legendAmount}>
                    ${formatCurrency(Number(item.totalAmount))}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: vh * 3,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelsSvg: {
    position: 'absolute',
  },
  chartInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: vh * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh * 0.8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF6FB',
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
    fontWeight: '500',
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003366',
  },
  legendAmount: {
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
});

export default ExpenseChart;
