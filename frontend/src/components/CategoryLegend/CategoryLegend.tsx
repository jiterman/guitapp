import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryLabel, getCategoryIcon } from '../../constants/categories';
import { EXPENSE_CATEGORY_COLORS } from '../../constants/expenseCategories';

const { height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const formatCurrency = (value: number) =>
  `$${new Intl.NumberFormat('es-AR').format(Math.round(value))}`;

const MAX_CATEGORIES = 5;

export interface CategoryLegendItem {
  category: string;
  totalAmount: number;
  percentage: number;
  changeVsPreviousMonth?: number | null;
}

interface CategoryLegendProps {
  data: CategoryLegendItem[];
}

const CategoryLegend: React.FC<CategoryLegendProps> = ({ data }) => {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? data : data.slice(0, MAX_CATEGORIES);

  return (
    <View style={styles.legendContainer}>
      {visible.map(item => {
        const color =
          EXPENSE_CATEGORY_COLORS[item.category as keyof typeof EXPENSE_CATEGORY_COLORS] ??
          '#07a3e4';
        const label = getCategoryLabel(item.category, 'EXPENSE');
        const iconName = getCategoryIcon(item.category) as keyof typeof Ionicons.glyphMap;
        return (
          <View key={item.category} style={styles.legendItem}>
            <View style={styles.legendHeader}>
              <View style={styles.legendLeft}>
                <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={iconName} size={18} color={color} />
                </View>
                <View style={styles.legendLabelRow}>
                  <Text style={styles.legendLabel}>{label}</Text>
                  {item.changeVsPreviousMonth != null && (
                    <View
                      style={[
                        styles.changeBadge,
                        {
                          backgroundColor:
                            item.changeVsPreviousMonth === 0
                              ? 'rgba(107,138,161,0.1)'
                              : item.changeVsPreviousMonth > 0
                                ? 'rgba(192,57,43,0.1)'
                                : 'rgba(26,158,92,0.1)',
                        },
                      ]}
                    >
                      {item.changeVsPreviousMonth === 0 ? (
                        <Text style={[styles.changeText, { color: '#6b8aa1' }]}>= 0%</Text>
                      ) : (
                        <Text
                          style={[
                            styles.changeText,
                            { color: item.changeVsPreviousMonth > 0 ? '#c0392b' : '#1a9e5c' },
                          ]}
                        >
                          {item.changeVsPreviousMonth > 0 ? '+ ' : '- '}
                          {Math.abs(item.changeVsPreviousMonth).toFixed(0)}%
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.legendRight}>
                <Text style={styles.legendAmount}>{formatCurrency(item.totalAmount)}</Text>
                <Text style={styles.legendPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        );
      })}
      {data.length > MAX_CATEGORIES && (
        <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAll(v => !v)}>
          <Text style={styles.showMoreText}>
            {showAll ? 'Ver menos' : `Ver todas las categorías (${data.length})`}
          </Text>
          <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={18} color="#6B84B1" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  legendRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  legendLabel: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '500',
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
});

export default CategoryLegend;
