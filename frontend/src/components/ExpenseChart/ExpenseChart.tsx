import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
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
  const [showAllCategories, setShowAllCategories] = useState(false);

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
      strokeColor: '#fff',
      strokeWidth: isSelected ? 4 : 2,
    };
  });

  const selectedData = selectedCategory
    ? data.find(item => item.category === selectedCategory)
    : null;

  const chartRadius = screenWidth * 0.35;
  const innerRadius = screenWidth * 0.2;
  const selectedColor = selectedData ? EXPENSE_CATEGORY_COLORS[selectedData.category] : null;
  const selectedIcon = selectedData ? getCategoryIcon(selectedData.category) : null;

  return (
    <>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>¿En qué gastaste?</Text>
        </View>
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
                {selectedData && selectedIcon && (
                  <View
                    style={[
                      styles.centerIconContainer,
                      {
                        borderColor: selectedColor || '#ccc',
                        backgroundColor: `${selectedColor}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={selectedIcon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={selectedColor || '#ccc'}
                    />
                  </View>
                )}
                <Text style={styles.totalLabel}>
                  {selectedData ? getCategoryLabel(selectedData.category, 'EXPENSE') : 'Total'}
                </Text>
                <Text style={styles.totalAmount}>
                  ${formatCurrency(selectedData ? Number(selectedData.totalAmount) : totalAmount)}
                </Text>
                {selectedData && (
                  <Text style={styles.percentageLabel}>{selectedData.percentage.toFixed(1)}%</Text>
                )}
              </View>
            )}
            showText={false}
            strokeWidth={2}
            strokeColor="#fff"
            innerCircleColor="#fff"
            innerCircleBorderWidth={selectedData ? 3 : 0}
            innerCircleBorderColor={selectedColor ?? 'transparent'}
          />
        </View>
      </View>

      <View style={styles.legendWrapper}>
        <View style={styles.legendContainer}>
          {(showAllCategories ? data : data.slice(0, 5)).map((item, index) => {
            const color = EXPENSE_CATEGORY_COLORS[item.category];
            const label = getCategoryLabel(item.category, 'EXPENSE');
            const iconName = getCategoryIcon(item.category) as keyof typeof Ionicons.glyphMap;
            return (
              <View key={index} style={styles.legendItem}>
                <View style={styles.legendHeader}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
                      <Ionicons name={iconName} size={18} color={color} />
                    </View>
                    <Text style={styles.legendLabel}>{label}</Text>
                  </View>
                  <View style={styles.legendRight}>
                    <Text style={styles.legendAmount}>
                      ${formatCurrency(Number(item.totalAmount))}
                    </Text>
                    <Text style={styles.legendPercentage}>{item.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
          {data.length > 5 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllCategories(!showAllCategories)}
            >
              <Text style={styles.showMoreText}>
                {showAllCategories ? 'Ver menos' : `Ver todas las categorías (${data.length})`}
              </Text>
              <Ionicons
                name={showAllCategories ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#6B84B1"
              />
            </TouchableOpacity>
          )}
        </View>
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
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6b8aa1',
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
    gap: 2,
  },
  legendPercentage: {
    fontSize: 12,
    color: '#6b8aa1',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003366',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vh * 1.8,
    gap: 8,
    marginTop: vh,
    backgroundColor: '#FDFDFE',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: '#6B84B1',
    fontWeight: '600',
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
