import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  recurringExpenseService,
  RecurringExpenseResponse,
} from '../services/recurringExpenseService';
import type { RecurrenceFrequency } from '../services/recurringIncomeService';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';
import { detailScreenStyles } from '../styles/detailScreenStyles';
import { recurringExpenseStyles as styles } from '../styles/recurringExpenseStyles';
import { formatDate } from '../utils/dateFormatter';
import { useDialog } from '../context/dialog';

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const frequencyLabel = (frequency: RecurrenceFrequency): string =>
  frequency === 'WEEKLY' ? 'Semanal' : 'Mensual';

const expenseTypeLabel = (type: RecurringExpenseResponse['type']): string =>
  type === 'FIXED' ? 'Fijo' : 'Variable';

const displayTitle = (item: RecurringExpenseResponse): string => {
  if (item.title?.trim()) return item.title.trim();
  if (item.description?.trim()) return item.description.trim();
  return getCategoryLabel(item.category, 'EXPENSE');
};

const RecurringExpensesScreen = () => {
  const { alert, confirm } = useDialog();
  const [items, setItems] = useState<RecurringExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const data = await recurringExpenseService.getRecurringExpenses();
      setItems(data);
    } catch {
      await alert({ title: 'Error', message: 'No se pudieron cargar los gastos recurrentes.' });
    } finally {
      setLoading(false);
    }
  }, [alert]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadItems();
    }, [loadItems])
  );

  const handleToggleActive = async (item: RecurringExpenseResponse) => {
    try {
      await recurringExpenseService.updateRecurringExpense(item.id, { active: !item.active });
      loadItems();
    } catch {
      await alert({ title: 'Error', message: 'No se pudo actualizar el gasto recurrente.' });
    }
  };

  const handleDelete = async (item: RecurringExpenseResponse) => {
    const confirmed = await confirm({
      title: 'Eliminar gasto recurrente',
      message:
        '¿Seguro que querés eliminar este gasto recurrente? No se borrarán los gastos ya generados.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'destructive',
    });
    if (!confirmed) return;

    try {
      await recurringExpenseService.deleteRecurringExpense(item.id);
      loadItems();
    } catch {
      await alert({ title: 'Error', message: 'No se pudo eliminar el gasto recurrente.' });
    }
  };

  return (
    <Layout style={detailScreenStyles.container}>
      <TouchableOpacity style={detailScreenStyles.backButtonTop} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="#07a3e4" />
        <Text style={detailScreenStyles.backButtonTopText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Gastos recurrentes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/add-movement',
              params: { type: 'EXPENSE', recurring: 'true' },
            })
          }
        >
          <Ionicons name="add" size={18} color="#0c2b52" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#07a3e4" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="repeat-outline" size={48} color="#90A4AE" />
          <Text style={styles.emptyText}>
            Todavía no tenés gastos recurrentes. Agregá uno para que se registre automáticamente.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {items.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name={getCategoryIcon(item.category) as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color="#c0392b"
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{displayTitle(item)}</Text>
                  <Text style={styles.cardAmount}>${formatMoney(item.amount)}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={18} color="#c0392b" />
                </TouchableOpacity>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Tipo</Text>
                <Text style={styles.metaValue}>{expenseTypeLabel(item.type)}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Frecuencia</Text>
                <Text style={styles.metaValue}>{frequencyLabel(item.frequency)}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Próximo gasto</Text>
                <Text style={styles.metaValue}>{formatDate(item.nextOccurrence)}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Estado</Text>
                <View style={[styles.badge, item.active ? styles.badgeActive : styles.badgePaused]}>
                  <Text
                    style={[
                      styles.badgeText,
                      item.active ? styles.badgeTextActive : styles.badgeTextPaused,
                    ]}
                  >
                    {item.active ? 'Activo' : 'Pausado'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.toggleLink} onPress={() => handleToggleActive(item)}>
                <Text style={styles.toggleLinkText}>{item.active ? 'Pausar' : 'Reanudar'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </Layout>
  );
};

export default RecurringExpensesScreen;
