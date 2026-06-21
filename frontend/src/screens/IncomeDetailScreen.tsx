import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import ExpandableField from '../components/ExpandableField/ExpandableField';
import { useDialog } from '../context/dialog';
import type { IncomeResponse } from '../services/incomeService';
import { incomeService } from '../services/incomeService';
import { getCategoryLabel, getCategoryIcon } from '../constants/categories';
import { detailScreenStyles as styles } from '../styles/detailScreenStyles';
import { formatDate } from '../utils/dateFormatter';

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const IncomeDetailScreen: React.FC = () => {
  const { incomeId } = useLocalSearchParams<{ incomeId?: string }>();
  const [income, setIncome] = useState<IncomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { alert, confirm } = useDialog();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setIsLoading(true);
      (async () => {
        try {
          if (!incomeId) {
            if (mounted) setIncome(null);
            return;
          }
          const found = await incomeService.getIncomeById(incomeId);
          if (mounted) setIncome(found);
        } catch {
          if (mounted) setIncome(null);
        } finally {
          if (mounted) setIsLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [incomeId])
  );

  const title = useMemo(() => {
    if (isLoading) return 'Detalle';
    if (!income) return 'Ingreso';
    const t = income.title?.trim();
    if (t) return t;
    return getCategoryLabel(income.category, 'INCOME');
  }, [isLoading, income]);

  const onDeletePress = async () => {
    if (!incomeId) return;
    const confirmed = await confirm({
      title: 'Eliminar ingreso',
      message: '¿Seguro que querés eliminar este ingreso?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await incomeService.deleteIncome(incomeId);
      router.back();
    } catch {
      await alert({ title: 'Error', message: 'No se pudo eliminar el ingreso.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const onEditPress = () => {
    if (!incomeId) return;
    router.push(`/income/${incomeId}/edit`);
  };

  return (
    <Layout style={styles.container}>
      {isLoading ? (
        <Text appearance="hint" style={styles.scrollContent}>
          Cargando...
        </Text>
      ) : !income ? (
        <View style={[styles.card, styles.scrollContent]}>
          <Text appearance="hint">No se encontró el ingreso.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!isLoading && income && (
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
                  disabled={!income}
                  style={styles.iconButtonEdit}
                >
                  <Feather name="edit-3" size={19} color="#07a3e4" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDeletePress}
                  disabled={!income || isDeleting}
                  style={styles.iconButtonDelete}
                >
                  <Feather name="trash-2" size={19} color="#c0392b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.iconCircleIncome}>
                <Ionicons name="trending-up" size={28} color="#1a9e5c" />
              </View>
              <View style={styles.amountContent}>
                <Text style={styles.amountLabel}>Monto</Text>
                <Text style={styles.amountValueIncome}>+${formatMoney(Number(income.amount))}</Text>
              </View>
            </View>

            {/* Description */}
            <ExpandableField
              label="Descripción"
              value={income.description}
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
                  name={getCategoryIcon(income.category) as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color="#07a3e4"
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Categoría</Text>
                <Text style={styles.detailValue}>
                  {getCategoryLabel(income.category, 'INCOME')}
                </Text>
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
                <Text style={styles.detailValue}>{formatDate(income.date)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Layout>
  );
};

export default IncomeDetailScreen;
