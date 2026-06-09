import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import ExpandableField from '../components/ExpandableField/ExpandableField';
import type { ExpenseResponse } from '../services/expenseService';
import { expenseService } from '../services/expenseService';
import { getCategoryLabel, getCategoryIcon } from '../constants/categories';
import { detailScreenStyles as styles } from '../styles/detailScreenStyles';
import { formatDate } from '../utils/dateFormatter';

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const typeLabelEs = (type: ExpenseResponse['type']) =>
  type === 'FIXED' ? 'Gasto fijo' : 'Gasto variable';

const ExpenseDetailScreen: React.FC = () => {
  const { expenseId } = useLocalSearchParams<{ expenseId?: string }>();
  const [expense, setExpense] = useState<ExpenseResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setIsLoading(true);
      (async () => {
        try {
          if (!expenseId) {
            if (mounted) setExpense(null);
            return;
          }
          const found = await expenseService.getExpenseById(expenseId);
          if (mounted) setExpense(found);
        } catch {
          if (mounted) setExpense(null);
        } finally {
          if (mounted) setIsLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [expenseId])
  );

  const title = useMemo(() => {
    if (isLoading) return 'Detalle';
    if (!expense) return 'Gasto';
    const t = expense.title?.trim();
    if (t) return t;
    return getCategoryLabel(expense.category, 'EXPENSE');
  }, [isLoading, expense]);

  const onDeletePress = () => {
    if (!expenseId) return;
    Alert.alert('Eliminar gasto', '¿Seguro que querés eliminar este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await expenseService.deleteExpense(expenseId);
            router.back();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el gasto.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const onEditPress = () => {
    if (!expenseId) return;
    router.push(`/expense/${expenseId}/edit`);
  };

  return (
    <Layout style={styles.container}>
      {isLoading ? (
        <Text appearance="hint" style={styles.scrollContent}>
          Cargando...
        </Text>
      ) : !expense ? (
        <View style={[styles.card, styles.scrollContent]}>
          <Text appearance="hint">No se encontró el gasto.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!isLoading && expense && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
              <Ionicons name="arrow-back" size={20} color="#07a3e4" />
              <Text style={styles.backButtonTopText}>Movimientos</Text>
            </TouchableOpacity>
          )}
          <View style={styles.card}>
            {/* Header with title and actions */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{title}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={onEditPress}
                  disabled={!expense}
                  style={styles.iconButtonEdit}
                >
                  <Feather name="edit-3" size={19} color="#07a3e4" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDeletePress}
                  disabled={!expense || isDeleting}
                  style={styles.iconButtonDelete}
                >
                  <Feather name="trash-2" size={19} color="#c0392b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.iconCircleExpense}>
                <Ionicons name="trending-down" size={28} color="#c0392b" />
              </View>
              <View style={styles.amountContent}>
                <Text style={styles.amountLabel}>Monto</Text>
                <Text style={styles.amountValueExpense}>
                  -${formatMoney(Number(expense.amount))}
                </Text>
              </View>
            </View>

            {/* Description */}
            <ExpandableField
              label="Descripción"
              value={expense.description}
              emptyText="Sin descripción"
              backgroundColor="#f5f5f5"
              iconName="document-text-outline"
              iconColor="#666"
              iconContainerStyle={styles.iconContainerGray}
            />

            {/* Category */}
            <View
              style={[styles.detailRow, styles.detailRowWithBg, { backgroundColor: '#e6f7ff' }]}
            >
              <View style={[styles.iconContainer, styles.iconContainerBlue]}>
                <Ionicons
                  name={getCategoryIcon(expense.category) as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color="#07a3e4"
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Categoría</Text>
                <Text style={styles.detailValue}>
                  {getCategoryLabel(expense.category, 'EXPENSE')}
                </Text>
              </View>
            </View>

            {/* Type */}
            <View
              style={[
                styles.detailRow,
                styles.detailRowWithBg,
                { backgroundColor: expense.type === 'FIXED' ? '#f4e8ff' : '#e8f8f0' },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  expense.type === 'FIXED' ? styles.iconContainerPurple : styles.iconContainerGreen,
                ]}
              >
                <Ionicons
                  name={expense.type === 'FIXED' ? 'repeat-outline' : 'stats-chart-outline'}
                  size={24}
                  color={expense.type === 'FIXED' ? '#8e44ad' : '#27ae60'}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tipo</Text>
                <Text style={styles.detailValue}>{typeLabelEs(expense.type)}</Text>
              </View>
            </View>

            {/* Date */}
            <View
              style={[styles.detailRowLast, styles.detailRowWithBg, { backgroundColor: '#fff4e6' }]}
            >
              <View style={[styles.iconContainer, styles.iconContainerOrange]}>
                <Ionicons name="calendar-outline" size={24} color="#f39c12" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Layout>
  );
};

export default ExpenseDetailScreen;
