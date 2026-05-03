import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const HomeScreen = () => {
  return (
    <Layout style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceAmount}>$150.000</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>↑ Ingresos</Text>
            <Text style={styles.incomeText}>$200.000</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>↓ Gastos</Text>
            <Text style={styles.expenseText}>$50.000</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/add-expense')}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Gasto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionDisabled]}>
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionLabel}>Ingreso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionDisabled]}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionLabel}>Resumen</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Últimos movimientos</Text>
      <View style={styles.emptyMovements}>
        <Text style={styles.emptyText}>Todavía no hay movimientos este mes.</Text>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    padding: screenWidth * 0.05,
  },
  balanceCard: {
    backgroundColor: '#003366',
    borderRadius: 20,
    padding: vh * 2.5,
    marginBottom: vh * 2.5,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: vh * 0.5,
  },
  balanceAmount: {
    color: '#FFBB00',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: vh * 1.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  balanceItemLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 2,
  },
  incomeText: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expenseText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    marginBottom: vh * 1.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: screenWidth * 0.03,
    marginBottom: vh * 3,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: vh * 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: vh * 0.5,
  },
  actionLabel: {
    fontSize: 12,
    color: '#003366',
    fontWeight: '600',
  },
  emptyMovements: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 2.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyText: {
    color: '#006699',
    fontSize: 14,
  },
});

export default HomeScreen;
