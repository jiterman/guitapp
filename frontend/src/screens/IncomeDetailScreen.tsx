import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, TextInput, TouchableOpacity, View } from 'react-native';
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
import { detailScreenStyles } from '../styles/detailScreenStyles';

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
              style={[styles.detailRowLast, styles.detailRowWithBg, { backgroundColor: '#fff4e6' }]}
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
    backgroundColor: '#e8f8f0',
  },
  amountValue: {
    ...detailScreenStyles.amountValue,
    color: '#1a9e5c',
  },
};

export default IncomeDetailScreen;
