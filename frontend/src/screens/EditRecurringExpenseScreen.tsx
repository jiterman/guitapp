import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { recurringExpenseService } from '../services/recurringExpenseService';
import type { RecurrenceFrequency } from '../services/recurringIncomeService';
import type { ExpenseType, ExpenseCategory } from '../constants/categories';
import { EXPENSE_CATEGORIES, ExpenseCategoryOption } from '../constants/categories';
import FrequencySegmentedControl from '../components/Recurring/FrequencySegmentedControl';
import { recurringFormStyles } from '../styles/recurringFormStyles';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import {
  transactionFormStyles as styles,
  ICON_SIZES,
  ICON_COLORS,
} from '../styles/transactionFormStyles';
import { formatDate, toLocalDateString, parseLocalDate } from '../utils/dateFormatter';
import ExpandableTextInput from '../components/ExpandableTextInput/ExpandableTextInput';
import DatePickerModal from '../components/DatePickerModal/DatePickerModal';
import { useDialog } from '../context/dialog';

const EditRecurringExpenseScreen = () => {
  const { alert } = useDialog();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const { recurringExpenseId } = useLocalSearchParams<{ recurringExpenseId?: string }>();
  const { displayValue, amount, handleAmountChange, setAmount } = useCurrencyInput();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryOption | null>(null);
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('MONTHLY');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
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
        if (!recurringExpenseId) {
          if (mounted) router.back();
          return;
        }
        const item = await recurringExpenseService.getRecurringExpenseById(recurringExpenseId);
        if (mounted) {
          setAmount(String(item.amount));
          setTitle(item.title ?? '');
          setDescription(item.description ?? '');
          if (item.description?.trim()) setShowDescription(true);
          const selected = EXPENSE_CATEGORIES.find(c => c.value === item.category) ?? null;
          setSelectedCategory(selected);
          setSelectedType(item.type);
          setFrequency(item.frequency);
          setStartDate(parseLocalDate(item.startDate));
        }
      } catch {
        if (mounted) {
          void alert({ title: 'Error', message: 'No se pudo cargar el gasto recurrente.' });
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
  }, [recurringExpenseId]);

  const filteredCategories = EXPENSE_CATEGORIES.filter(cat =>
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

  const onSubmit = async () => {
    if (!recurringExpenseId) return;

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
      await recurringExpenseService.updateRecurringExpense(recurringExpenseId, {
        amount: parseFloat(amount),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        category: selectedCategory!.value as ExpenseCategory,
        type: selectedType!,
        frequency,
        startDate: toLocalDateString(startDate),
      });
      router.back();
    } catch {
      await alert({
        title: 'Error',
        message: 'No se pudo actualizar el gasto recurrente. Intentá de nuevo.',
      });
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
            Editar gasto recurrente
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onScroll={e => {
            scrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
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

          <Text style={styles.label}>Título</Text>
          <View style={styles.inputWithIcon}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="text-outline" size={ICON_SIZES.small} color={ICON_COLORS.gray} />
            </View>
            <TextInput
              value={title}
              onChangeText={text => setTitle(text.slice(0, 20))}
              placeholder="Ej. Alquiler (opcional)"
              style={styles.textInput}
              placeholderTextColor="#B0BEC5"
              maxLength={20}
            />
          </View>

          {showDescription ? (
            <ExpandableTextInput
              label="Descripción"
              value={description}
              onChangeText={text => setDescription(text.slice(0, 255))}
              placeholder="Información adicional (opcional)"
              scrollViewRef={scrollViewRef}
              scrollYRef={scrollYRef}
              onRemove={() => {
                setDescription('');
                setShowDescription(false);
              }}
            />
          ) : (
            <TouchableOpacity
              style={styles.addDescriptionLink}
              onPress={() => setShowDescription(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color="#07a3e4" />
              <Text style={styles.addDescriptionText}>Agregar descripción</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>Categoría y tipo *</Text>
          <View
            style={[styles.categoryTypeCard, categoryError ? styles.categoryTypeCardError : null]}
          >
            <TouchableOpacity style={styles.categorySelector} onPress={() => setModalVisible(true)}>
              <View style={styles.dropdownContent}>
                <View style={styles.dropdownIconContainer}>
                  <Ionicons
                    name={
                      (selectedCategory?.icon || 'cart-outline') as keyof typeof Ionicons.glyphMap
                    }
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
              <Ionicons
                name="chevron-down"
                size={ICON_SIZES.medium}
                color={ICON_COLORS.secondary}
              />
            </TouchableOpacity>

            <View style={styles.categoryTypeDivider} />
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeChip, selectedType === 'FIXED' && styles.typeChipActive]}
                onPress={() => onSelectType('FIXED')}
              >
                <Ionicons
                  name="pin-outline"
                  size={14}
                  color={selectedType === 'FIXED' ? '#07a3e4' : '#6B8299'}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    selectedType === 'FIXED' && styles.typeChipTextActive,
                  ]}
                >
                  Fijo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeChip, selectedType === 'VARIABLE' && styles.typeChipActive]}
                onPress={() => onSelectType('VARIABLE')}
              >
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={selectedType === 'VARIABLE' ? '#07a3e4' : '#6B8299'}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    selectedType === 'VARIABLE' && styles.typeChipTextActive,
                  ]}
                >
                  Variable
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {categoryError && <Text style={styles.categoryErrorText}>{categoryError}</Text>}
          {typeError && <Text style={styles.typeErrorText}>{typeError}</Text>}

          <Text style={styles.label}>Recurrencia</Text>
          <View style={recurringFormStyles.recurringSubPanel}>
            <View style={recurringFormStyles.subRow}>
              <View style={recurringFormStyles.subRowLeading}>
                <Ionicons
                  name="sync-outline"
                  size={18}
                  color="#37618A"
                  style={recurringFormStyles.subRowIcon}
                />
                <Text style={recurringFormStyles.subRowLabel}>Frecuencia</Text>
              </View>
              <FrequencySegmentedControl value={frequency} onChange={setFrequency} />
            </View>

            <View style={recurringFormStyles.subRowDivider} />

            <TouchableOpacity
              style={recurringFormStyles.subRow}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={recurringFormStyles.subRowLeading}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#37618A"
                  style={recurringFormStyles.subRowIcon}
                />
                <Text style={recurringFormStyles.subRowLabel}>Inicia</Text>
              </View>
              <View style={recurringFormStyles.datePill}>
                <Text style={recurringFormStyles.datePillText}>{formatDate(startDate)}</Text>
                <Ionicons name="chevron-down" size={16} color="#07a3e4" />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
            onPress={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar</Text>
              </>
            )}
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
        <SafeAreaView style={styles.modalFullScreen}>
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
        </SafeAreaView>
      </Modal>

      <DatePickerModal
        visible={showDatePicker}
        date={startDate}
        onSelect={setStartDate}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
};

export default EditRecurringExpenseScreen;
