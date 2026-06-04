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
} from 'react-native';
import { Layout, Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { expenseService } from '../services/expenseService';
import type { ExpenseType } from '../constants/categories';
import {
  EXPENSE_CATEGORIES,
  ExpenseCategoryOption,
  getExpenseCategory,
} from '../constants/categories';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import {
  transactionFormStyles as styles,
  ICON_SIZES,
  ICON_COLORS,
} from '../styles/transactionFormStyles';
import { formatDate, toLocalDateString } from '../utils/dateFormatter';

const AddExpenseScreen = () => {
  const params = useLocalSearchParams();
  const { displayValue, amount, handleAmountChange } = useCurrencyInput(
    (params.amount as string) || ''
  );
  const [description, setDescription] = useState((params.description as string) || '');
  const initialCategory = getExpenseCategory(params.category as string) || null;
  const initialDate = params.date ? new Date(params.date as string) : new Date();

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryOption | null>(
    initialCategory
  );
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(
    initialCategory?.defaultType || null
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [scanningReceipt, setScanningReceipt] = useState(false);

  const onScanReceipt = () => {
    Alert.alert('Escanear ticket', 'Elegí una opción', [
      {
        text: 'Cámara',
        onPress: () => pickImage('camera'),
      },
      {
        text: 'Galería',
        onPress: () => pickImage('gallery'),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para escanear el ticket.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
    }

    if (result.canceled || !result.assets[0]) return;

    setScanningReceipt(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
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
          setSelectedType(cat.defaultType);
          setCategoryError(null);
          setTypeError(null);
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

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
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
      const dateString = toLocalDateString(selectedDate);
      await expenseService.addExpense({
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        category: selectedCategory!.value,
        type: selectedType!,
        date: dateString,
      });
      if (params.fromShareIntent === 'true') {
        router.replace('/(app)/home');
      } else {
        router.back();
      }
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
          <View style={styles.subHeaderActions}>
            <TouchableOpacity
              onPress={onScanReceipt}
              style={styles.scanButton}
              disabled={scanningReceipt}
            >
              <Ionicons name="camera-outline" size={18} color={ICON_COLORS.primary} />
              <Text style={styles.scanButtonText}>Escanear ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (params.fromShareIntent === 'true') {
                  router.replace('/(app)/home');
                } else {
                  router.back();
                }
              }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {scanningReceipt && (
          <View style={styles.scanOverlay}>
            <ActivityIndicator size="large" color="#2383F2" />
            <Text style={styles.scanOverlayText}>Analizando ticket...</Text>
          </View>
        )}

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

export default AddExpenseScreen;
