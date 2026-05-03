import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const HomeScreen = () => {
  return (
    <Layout style={styles.container}>
      <View style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <View>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>$150.000</Text>
          </View>
          <Ionicons name="sunny" size={56} color="#FFBB00" style={styles.sunIcon} />
        </View>
        <View style={styles.balanceRow}>
          <View style={styles.balanceSubCard}>
            <View style={styles.balanceSubCardInner}>
              <View style={styles.iconCircleGreen}>
                <Ionicons name="trending-up" size={16} color="#1a9e5c" />
              </View>
              <View>
                <Text style={styles.balanceItemLabel}>Ingresos</Text>
                <Text style={styles.incomeText}>$200.000</Text>
              </View>
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceSubCard}>
            <View style={styles.balanceSubCardInner}>
              <View style={styles.iconCircleRed}>
                <Ionicons name="trending-down" size={16} color="#c0392b" />
              </View>
              <View>
                <Text style={styles.balanceItemLabel}>Gastos</Text>
                <Text style={styles.expenseText}>$50.000</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Acciones</Text>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimos movimientos</Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() =>
            Alert.alert('Próximamente', 'Esta función estará disponible muy pronto. 🚀')
          }
        >
          <Text style={styles.seeAllText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={14} color="#07a3e4" />
        </TouchableOpacity>
      </View>
      <View style={styles.emptyMovements}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="wallet" size={36} color="#07a3e4" />
        </View>
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyText}>Todavía no hay movimientos este mes.</Text>
          <Text style={styles.emptySubText}>
            {'¡Agregá tu primer ingreso o gasto para verlo reflejado acá!'}
          </Text>
        </View>
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
    marginBottom: vh * 2.5,
    borderTopWidth: 4,
    borderTopColor: '#FFBB00',
    shadowColor: '#3a9fc0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh * 2,
    paddingBottom: vh * 2,
  },
  sunIcon: {
    opacity: 0.95,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: vh * 0.5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: vh * 1.75,
    borderTopWidth: 3,
    borderTopColor: '#FFBB00',
  },
  balanceSubCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  balanceSubCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26,158,92,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(192,57,43,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1.5,
    height: 50,
    backgroundColor: '#FFBB00',
    borderRadius: 1,
  },
  balanceItemLabel: {
    color: '#006699',
    fontSize: 16.5,
    fontWeight: '600',
  },
  incomeText: {
    color: '#1a9e5c',
    fontWeight: 'bold',
    fontSize: 22,
  },
  expenseText: {
    color: '#c0392b',
    fontWeight: 'bold',
    fontSize: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#07a3e4',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: screenWidth * 0.03,
    marginTop: vh * 1.5,
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
    padding: vh * 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F2FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextContainer: {
    flex: 1,
  },
  emptyText: {
    color: '#003366',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubText: {
    color: '#006699',
    fontSize: 13,
  },
});

export default HomeScreen;
