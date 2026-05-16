import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { incomeService } from '../services/incomeService';
import type { IncomeCategory } from '../services/incomeService';
import { INCOME_CATEGORIES, IncomeCategoryOption } from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { transactionFormStyles as styles } from '../styles/transactionFormStyles';

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

export default AddIncomeScreen;
