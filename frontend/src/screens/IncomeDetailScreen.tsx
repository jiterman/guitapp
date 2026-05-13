import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import { Button, Layout, Text } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { incomeService, IncomeResponse } from '../services/incomeService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const IncomeDetailScreen: React.FC = () => {
  const { incomeId } = useLocalSearchParams<{ incomeId?: string }>();
  const [income, setIncome] = useState<IncomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
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
  }, [incomeId]);

  const title = useMemo(() => {
    if (isLoading) return 'Detalle';
    if (!income) return 'Ingreso';
    return income.description ?? income.category ?? 'Ingreso';
  }, [isLoading, income]);

  const onDeletePress = () => {
    if (!incomeId) return;
    Alert.alert('Eliminar ingreso', '¿Seguro que querés eliminar este ingreso?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await incomeService.deleteIncome(incomeId);
            router.back();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el ingreso.');
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
      ) : !income ? (
        <View style={styles.card}>
          <Text appearance="hint">No se encontró el ingreso.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text appearance="hint">Monto</Text>
            <Text style={styles.amount}>+${formatMoney(Number(income.amount))}</Text>
          </View>
          <View style={styles.row}>
            <Text appearance="hint">Categoría</Text>
            <Text>{income.category}</Text>
          </View>
          <View style={styles.row}>
            <Text appearance="hint">Descripción</Text>
            <Text>{income.description ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text appearance="hint">Fecha</Text>
            <Text>{new Date(income.date).toLocaleString()}</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Button appearance="outline" onPress={() => router.back()}>
          Volver
        </Button>
        <Button status="danger" onPress={onDeletePress} disabled={!income || isDeleting}>
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
    color: '#1a9e5c',
    fontWeight: '800',
    marginTop: 4,
  },
  actions: {
    marginTop: vh * 2.2,
    gap: vh * 1.2,
  },
});

export default IncomeDetailScreen;
