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
import { Layout, Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import CameraModal from '../components/CameraModal/CameraModal';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const AddMovementScreen = () => {
  const params = useLocalSearchParams();
  const [movementType, setMovementType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const { displayValue, amount, handleAmountChange } = useCurrencyInput(
    (params.amount as string) || ''
  );
  const [description, setDescription] = useState((params.description as string) || '');
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
      if (analysis.description) {
        setDescription(analysis.description);
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
          description: description.trim() || undefined,
          category: selectedCategory!.value,
          type: selectedExpenseType!,
          date: dateString,
        });
      } else {
        await incomeService.addIncome({
          amount: parseFloat(amount),
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
          contentContainerStyle={{ paddingBottom: 100 }}
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

          <Text style={styles.label}>Descripción</Text>
          <View style={styles.inputWithIcon}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="document-text-outline" size={18} color="#90A4AE" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh * 2,
  },
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
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh * 2,
  },
  subHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8DCF0',
    backgroundColor: '#fff',
  },
  scanButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#07a3e4',
  },
  title: {
    fontSize: 22,
    color: '#003366',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
    marginTop: 16,
  },
  amountInputContainer: {
    backgroundColor: '#FFF9EB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F6C54F',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#506E96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  amountInputError: {
    borderColor: '#FF3333',
  },
  amountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  amountCurrencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F2A900',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F2A900',
    padding: 0,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#506E96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#003366',
    padding: 0,
  },
  errorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#506E96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  dropdownButtonError: {
    borderColor: '#FF3333',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#003366',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#B0BEC5',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#506E96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 4,
    shadowColor: '#506E96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#EAF4FF',
    borderWidth: 1,
    borderColor: '#8EC2FF',
  },
  typeButtonInactive: {
    backgroundColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#2383F2',
  },
  typeButtonTextInactive: {
    color: '#546E7A',
  },
  saveButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFBB00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#003366',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(230, 242, 252, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scanOverlayText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  modalClose: {
    fontSize: 20,
    color: '#003366',
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
  categoryIconContainer: {
    marginRight: 14,
  },
  categoryLabel: {
    fontSize: 15,
    color: '#003366',
  },
  categoryLabelSelected: {
    color: '#006699',
    fontWeight: 'bold',
  },
});

export default AddMovementScreen;
