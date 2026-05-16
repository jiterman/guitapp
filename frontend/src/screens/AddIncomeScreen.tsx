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
import { incomeService } from '../services/incomeService';
import type { IncomeCategory } from '../services/incomeService';
import { INCOME_CATEGORIES, IncomeCategoryOption } from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

const AddIncomeScreen = () => {
  const { displayValue, amount, handleAmountChange } = useCurrencyInput();
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IncomeCategoryOption | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const filteredCategories = INCOME_CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  const onSelectCategory = (cat: IncomeCategoryOption) => {
    setSelectedCategory(cat);
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
      const dateString = selectedDate.toISOString().split('T')[0];
      await incomeService.addIncome({
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        category: selectedCategory!.value as unknown as IncomeCategory,
        date: dateString,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo registrar el ingreso. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Layout style={styles.container}>
        <View style={styles.subHeader}>
          <Text category="h4" style={styles.title}>
            Agregar ingreso
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
            placeholder="Ej. Pago por proyecto (opcional)"
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
              name={selectedCategory?.icon || 'cash-outline'}
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

export default AddIncomeScreen;
