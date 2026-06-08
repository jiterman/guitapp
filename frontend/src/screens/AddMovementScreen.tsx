import React, { useState } from 'react';
import {
  View,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { transactionFormStyles as tStyles } from '../styles/transactionFormStyles';
import { Layout, Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import CameraModal from '../components/CameraModal/CameraModal';
import ExpandableTextInput from '../components/ExpandableTextInput/ExpandableTextInput';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import type { ExpenseType, IncomeCategory } from '../constants/categories';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ExpenseCategoryOption,
  IncomeCategoryOption,
  getExpenseCategory,
  getIncomeCategory,
} from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { formatDate, toLocalDateString } from '../utils/dateFormatter';

const vh = Dimensions.get('window').height / 100;

const AddMovementScreen = () => {
  const params = useLocalSearchParams();
  const [movementType, setMovementType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const { displayValue, amount, handleAmountChange } = useCurrencyInput(
    (params.amount as string) || ''
  );
  const [title, setTitle] = useState((params.title as string) || '');
  const [description, setDescription] = useState('');
  const initialCategory =
    movementType === 'EXPENSE'
      ? getExpenseCategory(params.category as string) || null
      : getIncomeCategory(params.category as string) || null;

  const initialDate = params.date ? new Date(params.date as string) : new Date();

  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategoryOption | IncomeCategoryOption | null
  >(initialCategory);
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType | null>(
    movementType === 'EXPENSE'
      ? (initialCategory as ExpenseCategoryOption)?.defaultType || 'VARIABLE'
      : null
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  const onScanReceipt = () => setCameraVisible(true);

  const onImageCaptured = async (uri: string) => {
    setCameraVisible(false);
    setScanningReceipt(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const analysis = await expenseService.analyzeReceipt(manipulated.uri);
      if (analysis.amount && analysis.amount > 0) {
        handleAmountChange(analysis.amount.toString());
      }
      if (analysis.title) {
        setTitle(analysis.title.slice(0, 20));
      }
      if (analysis.category) {
        const cat = getExpenseCategory(analysis.category);
        if (cat) {
          setSelectedCategory(cat);
          setSelectedExpenseType(cat.defaultType);
          setCategoryError(null);
        }
      }
      if (analysis.date) {
        setSelectedDate(new Date(analysis.date));
      }
    } catch {
      Alert.alert('Error', 'No se pudo analizar el ticket. Intentá de nuevo.');
    } finally {
      setScanningReceipt(false);
    }
  };

  const categories = movementType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  const onSelectCategory = (cat: ExpenseCategoryOption | IncomeCategoryOption) => {
    setSelectedCategory(cat);
    if (movementType === 'EXPENSE') {
      setSelectedExpenseType((cat as ExpenseCategoryOption).defaultType);
    }
    setCategoryError(null);
    setModalVisible(false);
    setSearch('');
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
  };

  const onSubmit = async () => {
    setAmountError(null);
    setCategoryError(null);
    let hasError = false;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError('Ingresá un monto válido mayor a 0.');
      hasError = true;
    }
    if (!selectedCategory) {
      setCategoryError('Seleccioná una categoría.');
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const dateString = toLocalDateString(selectedDate);
      if (movementType === 'EXPENSE') {
        await expenseService.addExpense({
          amount: parseFloat(amount),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          category: selectedCategory!.value,
          type: selectedExpenseType!,
          date: dateString,
        });
      } else {
        await incomeService.addIncome({
          amount: parseFloat(amount),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          category: selectedCategory!.value as unknown as IncomeCategory,
          date: dateString,
        });
      }

      if (params.fromShareIntent === 'true') {
        router.replace('/(app)/home');
      } else {
        router.back();
      }
    } catch {
      Alert.alert(
        'Error',
        `No se pudo registrar el ${movementType === 'EXPENSE' ? 'gasto' : 'ingreso'}. Intentá de nuevo.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleType = (type: 'EXPENSE' | 'INCOME') => {
    if (movementType !== type) {
      setMovementType(type);
      setSelectedCategory(null);
      setSelectedExpenseType(type === 'EXPENSE' ? 'VARIABLE' : null);
      setCategoryError(null);
    }
  };

  return (
    <>
      <Layout style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              movementType === 'EXPENSE' ? styles.tabActiveExpense : styles.tabInactive,
            ]}
            onPress={() => toggleType('EXPENSE')}
          >
            <Ionicons
              name="trending-down"
              size={18}
              color={movementType === 'EXPENSE' ? '#FF4D4D' : '#A8C8E0'}
            />
            <Text
              style={[
                styles.tabText,
                movementType === 'EXPENSE' ? styles.tabTextActiveExpense : styles.tabTextInactive,
              ]}
            >
              Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              movementType === 'INCOME' ? styles.tabActiveIncome : styles.tabInactive,
            ]}
            onPress={() => toggleType('INCOME')}
          >
            <Ionicons
              name="trending-up"
              size={18}
              color={movementType === 'INCOME' ? '#2ECC71' : '#A8C8E0'}
            />
            <Text
              style={[
                styles.tabText,
                movementType === 'INCOME' ? styles.tabTextActiveIncome : styles.tabTextInactive,
              ]}
            >
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subHeader}>
          <Text category="h4" style={styles.title}>
            {movementType === 'EXPENSE' ? 'Agregar gasto' : 'Agregar ingreso'}
          </Text>
          <View style={styles.subHeaderActions}>
            {movementType === 'EXPENSE' && (
              <TouchableOpacity
                onPress={onScanReceipt}
                style={styles.scanButton}
                disabled={scanningReceipt}
              >
                <Ionicons name="camera-outline" size={16} color="#07a3e4" />
                <Text style={styles.scanButtonText}>Escanear ticket</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                if (params.fromShareIntent === 'true') {
                  router.replace('/(app)/home');
                } else {
                  router.back();
                }
              }}
            >
              <Ionicons name="close" size={28} color="#003366" />
            </TouchableOpacity>
          </View>
        </View>

        {scanningReceipt && (
          <View style={styles.scanOverlay}>
            <ActivityIndicator size="large" color="#07a3e4" />
            <Text style={styles.scanOverlayText}>Analizando ticket...</Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
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
              <Ionicons name="text-outline" size={18} color="#90A4AE" />
            </View>
            <TextInput
              value={title}
              onChangeText={text => setTitle(text.slice(0, 20))}
              placeholder="Ej. Compra del mes (opcional)"
              style={styles.textInput}
              placeholderTextColor="#B0BEC5"
              maxLength={20}
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
                  name={
                    (selectedCategory?.icon ||
                      (movementType === 'EXPENSE'
                        ? 'cart-outline'
                        : 'cash-outline')) as keyof typeof Ionicons.glyphMap
                  }
                  size={18}
                  color="#07a3e4"
                />
              </View>
              <Text
                style={selectedCategory ? styles.dropdownButtonText : styles.dropdownPlaceholder}
              >
                {selectedCategory ? selectedCategory.label : 'Seleccioná una categoría'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#07a3e4" />
          </TouchableOpacity>
          {categoryError && <Text style={styles.errorText}>{categoryError}</Text>}

          <Text style={styles.label}>Fecha *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <View style={styles.dropdownIconContainer}>
              <Ionicons name="calendar-outline" size={18} color="#07a3e4" />
            </View>
            <Text style={styles.dropdownButtonText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#07a3e4" />
          </TouchableOpacity>

          {movementType === 'EXPENSE' && (
            <>
              <Text style={styles.label}>Tipo de gasto *</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedExpenseType === 'FIXED'
                      ? styles.typeButtonActive
                      : styles.typeButtonInactive,
                  ]}
                  onPress={() => setSelectedExpenseType('FIXED')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedExpenseType === 'FIXED'
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
                    selectedExpenseType === 'VARIABLE'
                      ? styles.typeButtonActive
                      : styles.typeButtonInactive,
                  ]}
                  onPress={() => setSelectedExpenseType('VARIABLE')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedExpenseType === 'VARIABLE'
                        ? styles.typeButtonTextActive
                        : styles.typeButtonTextInactive,
                    ]}
                  >
                    Variable
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <ExpandableTextInput
            label="Descripción"
            value={description}
            onChangeText={text => setDescription(text.slice(0, 255))}
            placeholder="Información adicional (opcional)"
          />
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={32} color="#fff" />
          )}
        </TouchableOpacity>
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
                    size={22}
                    color="#07a3e4"
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

      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={selectedDate}
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={onImageCaptured}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 4,
    marginBottom: vh * 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  tabActiveExpense: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  tabActiveIncome: {
    backgroundColor: '#F5FFF9',
    borderWidth: 1,
    borderColor: '#D1FFD1',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  tabTextActiveExpense: {
    color: '#FF4D4D',
  },
  tabTextActiveIncome: {
    color: '#2ECC71',
  },
  tabTextInactive: {
    color: '#A8C8E0',
  },
});

const styles = { ...tStyles, ...localStyles };

export default AddMovementScreen;
