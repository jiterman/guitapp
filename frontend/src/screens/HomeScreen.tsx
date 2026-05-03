import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layout, Text, Button, Spinner, Input } from '@ui-kitten/components';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { expenseService, ExpenseCategory } from '../services/expenseService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Comida', value: 'FOOD' },
  { label: 'Transporte', value: 'TRANSPORT' },
  { label: 'Entretenimiento', value: 'ENTERTAINMENT' },
  { label: 'Hogar', value: 'HOME' },
];

const HomeScreen = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setFirstName(profile.firstName || 'Usuario');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setFirstName('Usuario');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onLogoutPress = async () => {
    await authService.removeToken();
    router.replace('/login');
  };

  const resetModal = () => {
    setAmount('');
    setDescription('');
    setSelectedCategory(null);
  };

  const onSubmitExpense = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Ingresá un monto válido mayor a 0.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Seleccioná una categoría.');
      return;
    }

    setSubmitting(true);
    try {
      await expenseService.addExpense({
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        category: selectedCategory,
      });
      setModalVisible(false);
      resetModal();
      Alert.alert('¡Listo!', 'Gasto registrado correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo registrar el gasto. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size="giant" />
      </Layout>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Layout style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity onPress={onLogoutPress}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

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
          <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Agregar Gasto</Text>

            <Text style={styles.inputLabel}>Monto *</Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="Ej. 1500"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Descripción</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Ej. Almuerzo"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Categoría *</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.value && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === cat.value && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                style={styles.cancelButton}
                appearance="outline"
                onPress={() => {
                  setModalVisible(false);
                  resetModal();
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button style={styles.submitButton} onPress={onSubmitExpense} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: screenWidth * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    padding: vh * 2.5,
    marginBottom: vh * 2.5,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: vh * 0.5,
  },
  balanceAmount: {
    color: '#fff',
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
    color: 'rgba(255,255,255,0.8)',
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
    fontWeight: '600',
    color: '#2c3e50',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#2c3e50',
    fontWeight: '500',
  },
  emptyMovements: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: vh * 2.5,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: screenWidth * 0.06,
    paddingBottom: vh * 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: vh * 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: vh * 0.5,
  },
  input: {
    marginBottom: vh * 1.5,
    borderRadius: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: vh * 2.5,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  categoryChipSelected: {
    borderColor: '#3498db',
    backgroundColor: '#3498db',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#555',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
});

export default HomeScreen;
