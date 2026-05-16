import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Layout, Text, Button, Input } from '@ui-kitten/components';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { expenseService, type ExpenseType } from '../services/expenseService';
import { CATEGORIES, ExpenseCategoryOption } from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const AddExpenseScreen = () => {
  const { displayValue, amount, handleAmountChange } = useCurrencyInput();
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryOption | null>(null);
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  const onSelectCategory = (cat: ExpenseCategoryOption) => {
    setSelectedCategory(cat);
    setCategoryError(null);
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

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const monthNames = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const onSubmit = async () => {
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
      await expenseService.addExpense({
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        category: selectedCategory!.value,
        type: selectedType!,
        date: dateString,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo registrar el gasto. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Layout style={styles.container}>
        <View style={styles.subHeader}>
          <Text category="h4" style={styles.title}>
            Agregar gasto
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Monto *</Text>
        <View style={[styles.amountInputContainer, amountError ? styles.amountInputError : null]}>
          <Text style={styles.amountCurrencySymbol}>$</Text>
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
          <Ionicons
            name="document-text-outline"
            size={20}
            color="#B0BEC5"
            style={styles.inputIcon}
          />
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
            <Ionicons
              name={selectedCategory?.icon || 'cart-outline'}
              size={20}
              color="#07a3e4"
              style={styles.dropdownIcon}
            />
            <Text style={selectedCategory ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
              {selectedCategory ? selectedCategory.label : 'Seleccioná una categoría'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#07a3e4" />
        </TouchableOpacity>
        {categoryError && <Text style={styles.categoryErrorText}>{categoryError}</Text>}

        <Text style={styles.label}>Fecha *</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#07a3e4" style={styles.dropdownIcon} />
          <Text style={styles.dropdownButtonText}>{formatDate(selectedDate)}</Text>
          <Ionicons name="chevron-forward" size={20} color="#07a3e4" />
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
            <Text
              style={[
                styles.typeButtonText,
                selectedType === 'VARIABLE'
                  ? styles.typeButtonTextActive
                  : styles.typeButtonTextInactive,
              ]}
            >
              <Ionicons name="trending-up" size={14} /> Variable
            </Text>
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

        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh * 2,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh * 3,
  },
  closeButton: {
    fontSize: 20,
    color: '#006699',
    paddingHorizontal: 4,
  },
  title: {
    color: '#003366',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: vh * 0.8,
    marginTop: vh * 1.5,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
    marginBottom: vh * 0.8,
    marginTop: vh * 1.5,
  },
  amountInputContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
    paddingVertical: vh * 2,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh * 1,
  },
  amountInputError: {
    borderColor: '#FF3333',
  },
  amountCurrencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFA726',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '600',
    color: '#FFA726',
    padding: 0,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: vh * 1.3,
  },
  inputIcon: {
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
    marginTop: vh * 0.5,
    marginBottom: vh * 0.5,
  },
  categoryErrorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: vh * 0.6,
    marginBottom: vh * 0.5,
  },
  typeErrorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: vh * 0.6,
    marginBottom: vh * 0.5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: vh * 1.5,
  },
  dropdownButtonError: {
    borderColor: '#FF3333',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownIcon: {
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
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: vh * 1.3,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#42A5F5',
    borderColor: '#42A5F5',
  },
  typeButtonInactive: {
    backgroundColor: '#fff',
    borderColor: '#E0E0E0',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  typeButtonTextInactive: {
    color: '#757575',
  },
  saveButton: {
    backgroundColor: '#FFBB00',
    borderRadius: 12,
    paddingVertical: vh * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh * 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: vh * 1.5,
    marginTop: vh * 1,
  },
  cancelButtonText: {
    color: '#07a3e4',
    fontSize: 15,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: vh * 1.5,
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

export default AddExpenseScreen;
