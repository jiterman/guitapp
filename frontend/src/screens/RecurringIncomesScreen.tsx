import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const frequencyLabel = (frequency: RecurrenceFrequency): string =>
  frequency === 'WEEKLY' ? 'Semanal' : 'Mensual';

const RecurringIncomesScreen = () => {
  const [items, setItems] = useState<RecurringIncomeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const data = await recurringIncomeService.getRecurringIncomes();
      setItems(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los ingresos recurrentes.');
    } finally {
      setLoading(false);
    }
  }, []);

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
      Alert.alert('Error', 'No se pudo actualizar el ingreso recurrente.');
    }
  };

  const handleDelete = (item: RecurringIncomeResponse) => {
    Alert.alert(
      'Eliminar ingreso recurrente',
      '¿Seguro que querés eliminar este ingreso recurrente? No se borrarán los ingresos ya generados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await recurringIncomeService.deleteRecurringIncome(item.id);
              loadItems();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el ingreso recurrente.');
            }
          },
        },
      ]
    );
  };

  return (
    <Layout style={detailScreenStyles.container}>
      <TouchableOpacity style={detailScreenStyles.backButtonTop} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="#07a3e4" />
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
            Todavía no tenés ingresos recurrentes. Agregá uno para que se registre automáticamente.
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
                    color="#1a9e5c"
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>
                    {item.description?.trim() || getCategoryLabel(item.category, 'INCOME')}
                  </Text>
                  <Text style={styles.cardAmount}>${formatMoney(item.amount)}</Text>
                </View>
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

export default RecurringIncomesScreen;
