import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const HomeScreen = () => {
  return (
    <Layout style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance</Text>
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
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/add-expense')}
        >
          <Ionicons name="remove-circle-outline" size={40} color="#FFBB00" />
          <Text style={[styles.actionLabel, { color: '#07a3e4' }]}>Gasto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionDisabled]}>
          <Ionicons name="add-circle-outline" size={40} color="#FFBB00" />
          <Text style={styles.actionLabel}>Ingreso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionDisabled]}>
          <Ionicons name="bar-chart-outline" size={40} color="#FFBB00" />
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
    paddingTop: vh * 3,
  },
  balanceCard: {
    backgroundColor: '#5bbfdd',
    borderRadius: 24,
    padding: vh * 2.5,
    marginBottom: vh * 2.5,
    borderTopWidth: 4,
    borderTopColor: '#FFBB00',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    shadowColor: '#5bbfdd',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: vh * 0.5,
  },
  balanceAmount: {
    color: '#006699',
    fontSize: 38,
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
    backgroundColor: '#4ac5ff',
  },
  balanceItemLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    marginBottom: 2,
  },
  incomeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  expenseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
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
    paddingVertical: vh * 2,
    alignItems: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonPrimary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#07a3e4',
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionLabel: {
    fontSize: 15,
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
