import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Input, Layout, Text } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import type { IncomeCategory, IncomeResponse } from '../services/incomeService';
import { incomeService } from '../services/incomeService';
import { INCOME_CATEGORIES, IncomeCategoryOption } from '../constants/categories';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const IncomeDetailScreen: React.FC = () => {
  const { incomeId } = useLocalSearchParams<{ incomeId?: string }>();
  const [income, setIncome] = useState<IncomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<IncomeCategoryOption | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!income) return;
    if (isEditing) {
      setAmount(String(income.amount));
      setDescription(income.description ?? '');
      const selected = INCOME_CATEGORIES.find(c => c.value === income.category) ?? null;
      setSelectedCategory(selected);
    } else {
      setAmountError(null);
      setCategoryError(null);
      setModalVisible(false);
      setSearch('');
    }
  }, [income, isEditing]);

  const title = useMemo(() => {
    if (isLoading) return 'Detalle';
    if (!income) return 'Ingreso';
    return income.description ?? income.category ?? 'Ingreso';
  }, [isLoading, income]);

  const categoryLabel = useMemo(() => {
    if (!income) return null;
    return INCOME_CATEGORIES.find(c => c.value === income.category) ?? null;
  }, [income]);

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

  const filteredCategories = INCOME_CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  const onSelectCategory = (cat: IncomeCategoryOption) => {
    setSelectedCategory(cat);
    setCategoryError(null);
    setModalVisible(false);
    setSearch('');
  };

  const onSavePress = async () => {
    if (!incomeId || !income) return;

    setAmountError(null);
    setCategoryError(null);
    let hasError = false;

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Ingresá un monto válido mayor a 0.');
      hasError = true;
    }
    if (!selectedCategory) {
      setCategoryError('Seleccioná una categoría.');
      hasError = true;
    }
    if (hasError) return;

    try {
      setIsSaving(true);
      const updated = await incomeService.updateIncome(incomeId, {
        amount: parsedAmount,
        description: description.trim() || undefined,
        category: selectedCategory!.value as unknown as IncomeCategory,
      });
      setIncome(updated);
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el ingreso.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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
        ) : isEditing ? (
          <View style={styles.card}>
            <Text style={styles.label}>Monto *</Text>
            <Input
              value={amount}
              onChangeText={text => {
                setAmount(text);
                if (amountError) setAmountError(null);
              }}
              placeholder="Ej. 1500"
              keyboardType="decimal-pad"
              style={styles.input}
              status={amountError ? 'danger' : 'basic'}
            />
            {amountError && <Text style={styles.errorText}>{amountError}</Text>}

            <Text style={styles.label}>Descripción</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Ej. Pago por proyecto"
              style={styles.input}
            />

            <Text style={styles.label}>Categoría *</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, categoryError ? styles.dropdownButtonError : null]}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={selectedCategory ? styles.dropdownButtonText : styles.dropdownPlaceholder}
              >
                {selectedCategory
                  ? `${selectedCategory.icon}  ${selectedCategory.label}`
                  : 'Seleccioná una categoría'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {categoryError && <Text style={styles.categoryErrorText}>{categoryError}</Text>}

            <View style={styles.actions}>
              <Button appearance="outline" onPress={() => setIsEditing(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onPress={onSavePress} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text appearance="hint">Monto</Text>
              <Text style={styles.amount}>+${formatMoney(Number(income.amount))}</Text>
            </View>
            <View style={styles.row}>
              <Text appearance="hint">Descripción</Text>
              <Text>{income.description ?? '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text appearance="hint">Categoría</Text>
              <Text>
                {categoryLabel ? `${categoryLabel.icon}  ${categoryLabel.label}` : income.category}
              </Text>
            </View>
            <View style={styles.row}>
              <Text appearance="hint">Fecha</Text>
              <Text>{new Date(income.date).toLocaleString()}</Text>
            </View>
          </View>
        )}

        {!isEditing && (
          <View style={styles.actions}>
            <Button appearance="outline" onPress={() => router.back()}>
              Volver
            </Button>
            <Button onPress={() => setIsEditing(true)} disabled={!income}>
              Editar
            </Button>
            <Button status="danger" onPress={onDeletePress} disabled={!income || isDeleting}>
              Eliminar
            </Button>
          </View>
        )}
      </Layout>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setModalVisible(false);
          setSearch('');
        }}
      >
        <View style={styles.modalFullScreen}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categoría</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearch('');
                }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar categoría..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />

            <FlatList
              data={filteredCategories}
              keyExtractor={item => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategory?.value === item.value && styles.categoryItemSelected,
                  ]}
                  onPress={() => onSelectCategory(item)}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory?.value === item.value && styles.categoryLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: vh * 0.5,
  },
  input: {
    marginBottom: vh * 2,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: -vh * 1.5,
    marginBottom: vh * 1.5,
  },
  categoryErrorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: vh * 0.6,
    marginBottom: vh * 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: vh * 1.5,
    marginBottom: 0,
  },
  dropdownButtonError: {
    borderColor: '#FF3333',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#003366',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#aaa',
  },
  dropdownArrow: {
    fontSize: 11,
    color: '#006699',
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
  modalFullScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: vh * 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  modalClose: {
    fontSize: 18,
    color: '#006699',
  },
  searchInput: {
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    fontSize: 15,
    color: '#003366',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  categoryItemSelected: {
    backgroundColor: '#E6F2FC',
  },
  categoryIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  categoryLabel: {
    fontSize: 15,
    color: '#003366',
  },
  categoryLabelSelected: {
    color: '#006699',
    fontWeight: '600',
  },
});

export default IncomeDetailScreen;
