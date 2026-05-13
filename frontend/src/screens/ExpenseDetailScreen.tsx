import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import { Button, Layout, Text } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import type { ExpenseResponse } from '../services/expenseService';
import { expenseService } from '../services/expenseService';
import { CATEGORIES } from '../constants/categories';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const typeLabelEs = (type: ExpenseResponse['type']) =>
  type === 'FIXED' ? 'Gasto fijo' : 'Gasto variable';

const ExpenseDetailScreen: React.FC = () => {
  const { expenseId } = useLocalSearchParams<{ expenseId?: string }>();
  const [expense, setExpense] = useState<ExpenseResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
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
  }, [expenseId]);

  const categoryLabel = useMemo(() => {
    if (!expense) return null;
    return CATEGORIES.find(c => c.value === expense.category) ?? null;
  }, [expense]);

  const title = useMemo(() => {
    if (isLoading) return 'Detalle';
    if (!expense) return 'Gasto';
    return expense.description ?? categoryLabel?.label ?? expense.category ?? 'Gasto';
  }, [isLoading, expense, categoryLabel]);

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

  return (
    <Layout style={styles.container}>
      <Text category="h6" style={styles.title}>
        {title}
      </Text>

      {isLoading ? (
        <Text appearance="hint">Cargando...</Text>
      ) : !expense ? (
        <View style={styles.card}>
          <Text appearance="hint">No se encontró el gasto.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text appearance="hint">Monto</Text>
            <Text style={styles.amount}>-${formatMoney(Number(expense.amount))}</Text>
          </View>
          <View style={styles.row}>
            <Text appearance="hint">Descripción</Text>
            <Text>{expense.description ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text appearance="hint">Categoría</Text>
            <Text>
              {categoryLabel ? `${categoryLabel.icon}  ${categoryLabel.label}` : expense.category}
            </Text>
          </View>
          <View style={styles.row}>
            <Text appearance="hint">Tipo</Text>
            <Text>{typeLabelEs(expense.type)}</Text>
          </View>
          <View style={styles.row}>
            <Text appearance="hint">Fecha</Text>
            <Text>{new Date(expense.date).toLocaleString()}</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Button appearance="outline" onPress={() => router.back()}>
          Volver
        </Button>
        <Button status="danger" onPress={onDeletePress} disabled={!expense || isDeleting}>
          Eliminar
        </Button>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
    backgroundColor: '#E6F2FC',
  },
  title: {
    marginBottom: vh * 1.2,
    color: '#003366',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    marginBottom: vh * 1.2,
  },
  amount: {
    color: '#c0392b',
    fontWeight: '800',
    marginTop: 4,
  },
  actions: {
    marginTop: vh * 2.2,
    gap: vh * 1.2,
  },
});

export default ExpenseDetailScreen;
