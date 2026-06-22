import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  recurringIncomeService,
  RecurringIncomeResponse,
  RecurrenceFrequency,
} from '../services/recurringIncomeService';
import { getCategoryIcon, getCategoryLabel } from '../constants/categories';
import { detailScreenStyles } from '../styles/detailScreenStyles';
import { recurringIncomeStyles as styles } from '../styles/recurringIncomeStyles';
import { formatDate } from '../utils/dateFormatter';
import { formatMoney } from '../utils/currencyFormatter';
import { useDialog } from '../context/dialog';

const frequencyLabel = (frequency: RecurrenceFrequency): string =>
  frequency === 'WEEKLY' ? 'Semanal' : 'Mensual';

const displayTitle = (item: RecurringIncomeResponse): string => {
  if (item.title?.trim()) return item.title.trim();
  if (item.description?.trim()) return item.description.trim();
  return getCategoryLabel(item.category, 'INCOME');
};

const RecurringIncomesScreen = () => {
  const { alert, confirm } = useDialog();
  const [items, setItems] = useState<RecurringIncomeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const data = await recurringIncomeService.getRecurringIncomes();
      // Stable order by id so items don't jump around when paused/resumed.
      setItems([...data].sort((a, b) => a.id.localeCompare(b.id)));
    } catch {
      await alert({ title: 'Error', message: 'No se pudieron cargar los ingresos recurrentes.' });
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

  const handleToggleActive = async (item: RecurringIncomeResponse) => {
    try {
      await recurringIncomeService.updateRecurringIncome(item.id, { active: !item.active });
      loadItems();
    } catch {
      await alert({ title: 'Error', message: 'No se pudo actualizar el ingreso recurrente.' });
    }
  };

  const handleDelete = async (item: RecurringIncomeResponse) => {
    const confirmed = await confirm({
      title: 'Eliminar ingreso recurrente',
      message:
        '¿Seguro que querés eliminar este ingreso recurrente? No se borrarán los ingresos ya generados.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'destructive',
    });
    if (!confirmed) return;

    try {
      await recurringIncomeService.deleteRecurringIncome(item.id);
      loadItems();
    } catch {
      await alert({ title: 'Error', message: 'No se pudo eliminar el ingreso recurrente.' });
    }
  };

  return (
    <Layout style={detailScreenStyles.container}>
      <View style={styles.screen}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#07a3e4" />
          <Text style={detailScreenStyles.backButtonTopText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Ingresos recurrentes</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: '/add-movement',
                params: { type: 'INCOME', recurring: 'true' },
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
              Todavía no tenés ingresos recurrentes. Agregá uno para que se registre
              automáticamente.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {items.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name={getCategoryIcon(item.category) as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color="#1a9e5c"
                    />
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{displayTitle(item)}</Text>
                    <Text style={styles.cardAmount}>${formatMoney(item.amount)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      router.push({
                        pathname: '/recurring-income/[recurringIncomeId]/edit',
                        params: { recurringIncomeId: item.id },
                      })
                    }
                  >
                    <Ionicons name="pencil-outline" size={18} color="#07a3e4" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={18} color="#c0392b" />
                  </TouchableOpacity>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Frecuencia</Text>
                  <Text style={styles.metaValue}>{frequencyLabel(item.frequency)}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Próximo ingreso</Text>
                  <Text style={styles.metaValue}>{formatDate(item.nextOccurrence)}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Estado</Text>
                  <View
                    style={[styles.badge, item.active ? styles.badgeActive : styles.badgePaused]}
                  >
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

                <View style={styles.cardDivider} />

                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => handleToggleActive(item)}
                >
                  <Ionicons
                    name={item.active ? 'pause-outline' : 'play-outline'}
                    size={16}
                    color="#07a3e4"
                  />
                  <Text style={styles.toggleButtonText}>{item.active ? 'Pausar' : 'Reanudar'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Layout>
  );
};

export default RecurringIncomesScreen;
