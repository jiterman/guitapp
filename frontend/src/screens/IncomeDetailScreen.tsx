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
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { IncomeCategory, IncomeResponse } from '../services/incomeService';
import { incomeService } from '../services/incomeService';
import {
  INCOME_CATEGORIES,
  IncomeCategoryOption,
  getCategoryLabel,
  getCategoryIcon,
} from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

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

  const { displayValue, amount, handleAmountChange, setAmount } = useCurrencyInput();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, isEditing]);

  const title = useMemo(() => {
    if (isLoading) return 'Detalle';
    if (!income) return 'Ingreso';
    const desc = income.description?.trim();
    if (desc) return desc;
    return getCategoryLabel(income.category, 'INCOME');
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
      const trimmedDescription = description.trim();
      const updated = await incomeService.updateIncome(incomeId, {
        amount: parsedAmount,
        description: trimmedDescription || undefined,
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
        {!isLoading && income && !isEditing && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
            <Ionicons name="arrow-back" size={20} color="#07a3e4" />
            <Text style={styles.backButtonTopText}>Movimientos</Text>
          </TouchableOpacity>
        )}

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
              value={displayValue}
              onChangeText={text => {
                handleAmountChange(text);
                if (amountError) setAmountError(null);
              }}
              placeholder="0,00"
              keyboardType="decimal-pad"
              style={styles.input}
              status={amountError ? 'danger' : 'basic'}
              accessoryLeft={() => <Text style={styles.currencySymbol}>$</Text>}
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
          <View style={styles.cardWrapper}>
            <View style={styles.cardTopBorder} />
            <View style={styles.cardContent}>
              {/* Header with title and actions */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
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
                <View style={styles.iconCircle}>
                  <Ionicons name="trending-up" size={28} color="#1a9e5c" />
                </View>
                <View style={styles.amountContent}>
                  <Text style={styles.amountLabel}>Monto</Text>
                  <Text style={styles.amountValue}>+${formatMoney(Number(income.amount))}</Text>
                </View>
              </View>

              {/* Description */}
              <View
                style={[styles.detailRow, styles.detailRowWithBg, { backgroundColor: '#f5f5f5' }]}
              >
                <View style={[styles.iconContainer, styles.iconContainerGray]}>
                  <Ionicons name="document-text-outline" size={24} color="#666" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Descripción</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      !income.description?.trim() && styles.detailValueItalic,
                    ]}
                  >
                    {income.description?.trim() ? income.description : 'Sin descripción'}
                  </Text>
                </View>
              </View>

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
                style={[
                  styles.detailRowLast,
                  styles.detailRowWithBg,
                  { backgroundColor: '#fff4e6' },
                ]}
              >
                <View style={[styles.iconContainer, styles.iconContainerOrange]}>
                  <Ionicons name="calendar-outline" size={24} color="#f39c12" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Fecha</Text>
                  <Text style={styles.detailValue}>{new Date(income.date).toLocaleString()}</Text>
                </View>
              </View>
            </View>
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
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: vh * 1.5,
  },
  backButtonTopText: {
    fontSize: 14,
    color: '#07a3e4',
    fontWeight: '400',
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
  currencySymbol: {
    fontSize: 16,
    color: '#003366',
    marginLeft: 8,
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
  cardWrapper: {
    borderRadius: 20,
    borderTopWidth: 4,
    borderTopColor: '#FFBB00',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTopBorder: {
    height: 0,
  },
  cardContent: {
    padding: vh * 2.5,
    paddingTop: vh * 2.1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: vh * 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#105fb0',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButtonEdit: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
  },
  iconButtonDelete: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vh * 2,
    borderBottomWidth: 0,
    marginBottom: vh,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e8f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  amountContent: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a9e5c',
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagIncome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    color: '#1a9e5c',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: vh * 1.2,
    borderBottomWidth: 0,
    marginBottom: vh * 1.5,
  },
  detailRowWithBg: {
    borderRadius: 12,
    paddingHorizontal: vh * 1.5,
  },
  detailRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: vh * 1.2,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerGray: {
    backgroundColor: '#e8e8e8',
  },
  iconContainerBlue: {
    backgroundColor: '#cceeff',
  },
  iconContainerOrange: {
    backgroundColor: '#ffe8c5',
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#003366',
    fontWeight: '500',
  },
  detailValueItalic: {
    fontStyle: 'italic',
    color: '#999',
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
