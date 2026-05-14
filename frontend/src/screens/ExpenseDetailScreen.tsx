import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Input, Layout, Text } from '@ui-kitten/components';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ExpenseCategory, ExpenseResponse, ExpenseType } from '../services/expenseService';
import { expenseService } from '../services/expenseService';
import {
  CATEGORIES,
  ExpenseCategoryOption,
  getCategoryLabel,
  getCategoryIcon,
} from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { detailScreenStyles } from '../styles/detailScreenStyles';

const formatMoney = (amount: number) => new Intl.NumberFormat('es-AR').format(Number(amount));

const typeLabelEs = (type: ExpenseResponse['type']) =>
  type === 'FIXED' ? 'Gasto fijo' : 'Gasto variable';

const ExpenseDetailScreen: React.FC = () => {
  const { expenseId } = useLocalSearchParams<{ expenseId?: string }>();
  const [expense, setExpense] = useState<ExpenseResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { displayValue, amount, handleAmountChange, setAmount } = useCurrencyInput();
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryOption | null>(null);
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!expenseId) {
          if (mounted) setExpense(null);
          return;
        }
        const found = await expenseService.getExpenseById(expenseId);
        if (mounted) setExpense(found);
      } catch {
        if (mounted) setExpense(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [expenseId]);

  useEffect(() => {
    if (!expense) return;
    if (isEditing) {
      setAmount(String(expense.amount));
      setDescription(expense.description ?? '');
      const selected = CATEGORIES.find(c => c.value === expense.category) ?? null;
      setSelectedCategory(selected);
      setSelectedType(expense.type);
    } else {
      setAmountError(null);
      setCategoryError(null);
      setTypeError(null);
      setModalVisible(false);
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense, isEditing]);

  const title = useMemo(() => {
    if (isLoading) return 'Detalle';
    if (!expense) return 'Gasto';
    const desc = expense.description?.trim();
    if (desc) return desc;
    return getCategoryLabel(expense.category, 'EXPENSE');
  }, [isLoading, expense]);

  const onDeletePress = () => {
    if (!expenseId) return;
    Alert.alert('Eliminar gasto', '¿Seguro que querés eliminar este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await expenseService.deleteExpense(expenseId);
            router.back();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el gasto.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  const onSelectCategory = (cat: ExpenseCategoryOption) => {
    setSelectedCategory(cat);
    setCategoryError(null);
    setModalVisible(false);
    setSearch('');
  };

  const onSelectType = (t: ExpenseType) => {
    setSelectedType(t);
    if (typeError) setTypeError(null);
  };

  const onSavePress = async () => {
    if (!expenseId || !expense) return;

    setAmountError(null);
    setCategoryError(null);
    setTypeError(null);
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
    if (!selectedType) {
      setTypeError('Seleccioná el tipo de gasto.');
      hasError = true;
    }
    if (hasError) return;

    try {
      setIsSaving(true);
      const trimmedDescription = description.trim();
      const updated = await expenseService.updateExpense(expenseId, {
        amount: parsedAmount,
        description: trimmedDescription || undefined,
        category: selectedCategory!.value as ExpenseCategory,
        type: selectedType!,
      });
      setExpense(updated);
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el gasto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Layout style={styles.container}>
        {!isLoading && expense && !isEditing && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
            <Ionicons name="arrow-back" size={20} color="#07a3e4" />
            <Text style={styles.backButtonTopText}>Movimientos</Text>
          </TouchableOpacity>
        )}

        {isLoading ? (
          <Text appearance="hint">Cargando...</Text>
        ) : !expense ? (
          <View style={styles.card}>
            <Text appearance="hint">No se encontró el gasto.</Text>
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
              placeholder="Ej. Compra del mes (opcional)"
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

            <Text style={styles.typeLabel}>Tipo de gasto *</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === 'FIXED' ? styles.typeButtonActive : styles.typeButtonInactive,
                ]}
                onPress={() => onSelectType('FIXED')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'FIXED'
                      ? styles.typeButtonTextActive
                      : styles.typeButtonTextInactive,
                  ]}
                >
                  Fijo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedType === 'VARIABLE' ? styles.typeButtonActive : styles.typeButtonInactive,
                ]}
                onPress={() => onSelectType('VARIABLE')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'VARIABLE'
                      ? styles.typeButtonTextActive
                      : styles.typeButtonTextInactive,
                  ]}
                >
                  Variable
                </Text>
              </TouchableOpacity>
            </View>
            {typeError && <Text style={styles.typeErrorText}>{typeError}</Text>}

            <View style={styles.actions}>
              <Button onPress={onSavePress} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button appearance="outline" onPress={() => setIsEditing(false)} disabled={isSaving}>
                Cancelar
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            {/* Header with title and actions */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{title}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  disabled={!expense}
                  style={styles.iconButtonEdit}
                >
                  <Feather name="edit-3" size={19} color="#07a3e4" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDeletePress}
                  disabled={!expense || isDeleting}
                  style={styles.iconButtonDelete}
                >
                  <Feather name="trash-2" size={19} color="#c0392b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="trending-down" size={28} color="#c0392b" />
              </View>
              <View style={styles.amountContent}>
                <Text style={styles.amountLabel}>Monto</Text>
                <Text style={styles.amountValue}>-${formatMoney(Number(expense.amount))}</Text>
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
                    !expense.description?.trim() && styles.detailValueItalic,
                  ]}
                >
                  {expense.description?.trim() ? expense.description : 'Sin descripción'}
                </Text>
              </View>
            </View>

            {/* Category */}
            <View
              style={[styles.detailRow, styles.detailRowWithBg, { backgroundColor: '#e6f7ff' }]}
            >
              <View style={[styles.iconContainer, styles.iconContainerBlue]}>
                <Ionicons
                  name={getCategoryIcon(expense.category) as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color="#07a3e4"
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Categoría</Text>
                <Text style={styles.detailValue}>
                  {getCategoryLabel(expense.category, 'EXPENSE')}
                </Text>
              </View>
            </View>

            {/* Type */}
            <View
              style={[
                styles.detailRow,
                styles.detailRowWithBg,
                { backgroundColor: expense.type === 'FIXED' ? '#f4e8ff' : '#e8f8f0' },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  expense.type === 'FIXED' ? styles.iconContainerPurple : styles.iconContainerGreen,
                ]}
              >
                <Ionicons
                  name={expense.type === 'FIXED' ? 'repeat-outline' : 'stats-chart-outline'}
                  size={24}
                  color={expense.type === 'FIXED' ? '#8e44ad' : '#27ae60'}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tipo</Text>
                <Text style={styles.detailValue}>{typeLabelEs(expense.type)}</Text>
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
                <Text style={styles.detailValue}>{new Date(expense.date).toLocaleString()}</Text>
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

const styles = {
  ...detailScreenStyles,
  iconCircle: {
    ...detailScreenStyles.iconCircle,
    backgroundColor: '#fce8e6',
  },
  amountValue: {
    ...detailScreenStyles.amountValue,
    color: '#c0392b',
  },
};

export default ExpenseDetailScreen;
