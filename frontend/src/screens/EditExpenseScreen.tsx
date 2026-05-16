import React, { useEffect, useState } from 'react';
import {
  View,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { expenseService, type ExpenseType, type ExpenseCategory } from '../services/expenseService';
import { CATEGORIES, ExpenseCategoryOption } from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import {
  transactionFormStyles as styles,
  ICON_SIZES,
  ICON_COLORS,
} from '../styles/transactionFormStyles';
import { formatDate } from '../utils/dateFormatter';

const EditExpenseScreen = () => {
  const { expenseId } = useLocalSearchParams<{ expenseId?: string }>();
  const { displayValue, amount, handleAmountChange, setAmount } = useCurrencyInput();
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryOption | null>(null);
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
          if (mounted) router.back();
          return;
        }
        const expense = await expenseService.getExpenseById(expenseId);
        if (mounted) {
          setAmount(String(expense.amount));
          setDescription(expense.description ?? '');
          const selected = CATEGORIES.find(c => c.value === expense.category) ?? null;
          setSelectedCategory(selected);
          setSelectedType(expense.type);
          setSelectedDate(new Date(expense.date));
        }
      } catch {
        if (mounted) {
          Alert.alert('Error', 'No se pudo cargar el gasto.');
          router.back();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseId]);

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  const onSelectCategory = (cat: ExpenseCategoryOption) => {
    setSelectedCategory(cat);
    setSelectedType(cat.defaultType);
    setCategoryError(null);
    setTypeError(null);
    setModalVisible(false);
    setSearch('');
  };

  const onSelectType = (type: ExpenseType) => {
    setSelectedType(type);
    setTypeError(null);
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
  };

  const onSubmit = async () => {
    if (!expenseId) return;

    setAmountError(null);
    setCategoryError(null);
    setTypeError(null);
    let hasError = false;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError('Ingresá un monto válido mayor a 0.');
      hasError = true;
    }
    if (!selectedCategory) {
      setCategoryError('Seleccioná una categoría.');
      hasError = true;
    }
    if (!selectedType) {
      setTypeError('Seleccioná si es un gasto fijo o variable.');
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      await expenseService.updateExpense(expenseId, {
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        category: selectedCategory!.value as ExpenseCategory,
        type: selectedType!,
        date: dateString,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el gasto. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout style={styles.container}>
        <Text appearance="hint">Cargando...</Text>
      </Layout>
    );
  }

  return (
    <>
      <Layout style={styles.container}>
        <View style={styles.subHeader}>
          <Text category="h4" style={styles.title}>
            Editar gasto
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Monto *</Text>
          <View style={[styles.amountInputContainer, amountError ? styles.amountInputError : null]}>
            <View style={styles.amountIconContainer}>
              <Text style={styles.amountCurrencySymbol}>$</Text>
            </View>
            <TextInput
              value={displayValue}
              onChangeText={text => {
                handleAmountChange(text);
                if (amountError) setAmountError(null);
              }}
              placeholder="0,00"
              keyboardType="decimal-pad"
              style={styles.amountInput}
              placeholderTextColor="#FFC947"
            />
          </View>
          {amountError && <Text style={styles.errorText}>{amountError}</Text>}

          <Text style={styles.label}>Descripción</Text>
          <View style={styles.inputWithIcon}>
            <View style={styles.inputIconContainer}>
              <Ionicons
                name="document-text-outline"
                size={ICON_SIZES.small}
                color={ICON_COLORS.gray}
              />
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ej. Compra del mes (opcional)"
              style={styles.textInput}
              placeholderTextColor="#B0BEC5"
            />
          </View>

          <Text style={styles.label}>Categoría *</Text>
          <TouchableOpacity
            style={[styles.dropdownButton, categoryError ? styles.dropdownButtonError : null]}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.dropdownContent}>
              <View style={styles.dropdownIconContainer}>
                <Ionicons
                  name={selectedCategory?.icon || 'cart-outline'}
                  size={ICON_SIZES.small}
                  color={ICON_COLORS.primary}
                />
              </View>
              <Text
                style={selectedCategory ? styles.dropdownButtonText : styles.dropdownPlaceholder}
              >
                {selectedCategory ? selectedCategory.label : 'Seleccioná una categoría'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={ICON_SIZES.medium} color={ICON_COLORS.secondary} />
          </TouchableOpacity>
          {categoryError && <Text style={styles.categoryErrorText}>{categoryError}</Text>}

          <Text style={styles.label}>Fecha *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <View style={styles.dropdownIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={ICON_SIZES.small}
                color={ICON_COLORS.primary}
              />
            </View>
            <Text style={styles.dropdownButtonText}>{formatDate(selectedDate)}</Text>
            <Ionicons
              name="chevron-forward"
              size={ICON_SIZES.medium}
              color={ICON_COLORS.secondary}
            />
          </TouchableOpacity>

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
              {selectedType === 'VARIABLE' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="trending-up" size={16} color="#2383F2" />
                  <Text style={[styles.typeButtonText, styles.typeButtonTextActive]}>Variable</Text>
                </View>
              ) : (
                <Text style={[styles.typeButtonText, styles.typeButtonTextInactive]}>Variable</Text>
              )}
            </TouchableOpacity>
          </View>
          {typeError && <Text style={styles.typeErrorText}>{typeError}</Text>}

          <TouchableOpacity
            style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
            onPress={onSubmit}
            disabled={submitting}
          >
            <MaterialIcons name="save" size={20} color="#000" style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={ICON_SIZES.large}
                    color={ICON_COLORS.secondary}
                    style={styles.categoryIconContainer}
                  />
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

      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={selectedDate}
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
};

export default EditExpenseScreen;
