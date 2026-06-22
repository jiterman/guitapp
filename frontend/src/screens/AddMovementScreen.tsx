import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Switch,
} from 'react-native';
import { transactionFormStyles as tStyles } from '../styles/transactionFormStyles';
import { Layout, Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import CameraModal from '../components/CameraModal/CameraModal';
import ExpandableTextInput from '../components/ExpandableTextInput/ExpandableTextInput';
import DatePickerModal from '../components/DatePickerModal/DatePickerModal';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { ruleService } from '../services/ruleService';
import { useModal } from '../hooks/Profile/useModal';
import { CategoryRuleModal } from '../components/Rules/CategoryRule/Modal/CategoryRuleModal';
import { CategoryRuleSuggestion } from '../components/Rules/CategoryRule/Banners/CategoryRuleSuggestion';
import { useRules } from '../context/rules';
import { useDialog } from '../context/dialog';
import {
  recurringIncomeService,
  type RecurrenceFrequency,
} from '../services/recurringIncomeService';
import { recurringExpenseService } from '../services/recurringExpenseService';
import type { ExpenseType, IncomeCategory, ExpenseCategory } from '../constants/categories';
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
// Shared width so the date pill matches the Frequency segmented control.
const RECURRENCE_CONTROL_WIDTH = 168;
interface InferredRuleBannerProps {
  isVisible: boolean;
}

const InferredRuleBanner: React.FC<InferredRuleBannerProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <View style={styles.inferredBannerContainer}>
      <Ionicons
        name="information-circle-outline"
        size={16}
        color="#07a3e4"
        style={{ marginRight: 6 }}
      />
      <Text style={styles.inferredBannerText}>Tipo de gasto inferido por regla existente</Text>
    </View>
  );
};

const AddMovementScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const params = useLocalSearchParams();
  const [movementType, setMovementType] = useState<'EXPENSE' | 'INCOME'>(
    params.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
  );

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
  const [showDescription, setShowDescription] = useState(false);
  const [isRecurring, setIsRecurring] = useState(params.recurring === 'true');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('MONTHLY');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  // Estados para el flujo de la regla sugerida
  const suggestRuleModal = useModal();
  const [suggestedRuleData, setSuggestedRuleData] = useState<any | null>(null);
  const [ruleSaving, setRuleSaving] = useState(false);

  // Aviso de regla inferida
  const { rules, addRule } = useRules();
  const { alert } = useDialog();
  const [showInferredNotice, setShowInferredNotice] = useState(false);

  useEffect(() => {
    if (movementType === 'EXPENSE' && selectedCategory?.value) {
      const matchingRule = rules.find(r => r.category === selectedCategory.value);

      if (matchingRule) {
        setSelectedExpenseType(matchingRule.type as ExpenseType);
        setShowInferredNotice(true);
      } else {
        setShowInferredNotice(false);
      }
    } else {
      setShowInferredNotice(false);
    }
  }, [selectedCategory, movementType, rules]);

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
          const ruleMatch = rules.find(r => r.category === cat.value);
          setSelectedExpenseType(ruleMatch ? (ruleMatch.type as ExpenseType) : cat.defaultType);
        }
      }
      if (analysis.date) {
        setSelectedDate(new Date(analysis.date));
      }
    } catch {
      await alert({ title: 'Error', message: 'No se pudo analizar el ticket. Intentá de nuevo.' });
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
      const matchingRule = rules.find(r => r.category === cat.value);
      setSelectedExpenseType(
        matchingRule
          ? (matchingRule.type as ExpenseType)
          : (cat as ExpenseCategoryOption).defaultType
      );
    }
    setCategoryError(null);
    setModalVisible(false);
    setSearch('');
  };

  const onDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const today = startOfDay(new Date());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const isToday = isSameDay(selectedDate, today);
  const isYesterday = isSameDay(selectedDate, yesterday);
  const isCustomDate = !isToday && !isYesterday;

  const handleAcceptRuleSuggestion = (categoryValue: string, type: 'FIXED' | 'VARIABLE') => {
    setSuggestedRuleData({
      id: 0,
      category: categoryValue,
      type: type,
    });
    suggestRuleModal.open();
  };

  const handleSaveSuggestedRule = async (categoryValue: string, type: 'FIXED' | 'VARIABLE') => {
    setRuleSaving(true);
    try {
      const response = await ruleService.createCategoryRule({
        category: categoryValue as ExpenseCategory,
        type: type,
      });
      addRule(response);
      suggestRuleModal.close();
    } catch (e: any) {
      console.error('Error detectado al guardar regla sugerida:', e);
      throw e;
    } finally {
      setRuleSaving(false);
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
        if (isRecurring) {
          await recurringExpenseService.addRecurringExpense({
            amount: parseFloat(amount),
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            category: selectedCategory!.value as ExpenseCategory,
            type: selectedExpenseType!,
            frequency,
            startDate: dateString,
          });
        } else {
          await expenseService.addExpense({
            amount: parseFloat(amount),
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            category: selectedCategory!.value,
            type: selectedExpenseType!,
            date: dateString,
          });
        }
      } else if (isRecurring) {
        await recurringIncomeService.addRecurringIncome({
          amount: parseFloat(amount),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          category: selectedCategory!.value as unknown as IncomeCategory,
          frequency,
          startDate: dateString,
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
      await alert({
        title: 'Error',
        message: `No se pudo registrar el ${movementType === 'EXPENSE' ? 'gasto' : 'ingreso'}. Intentá de nuevo.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleType = (type: 'EXPENSE' | 'INCOME') => {
    if (movementType !== type) {
      setMovementType(type);
      setSelectedCategory(null);
      setSelectedExpenseType(type === 'EXPENSE' ? 'VARIABLE' : null);
      setIsRecurring(false);
      setCategoryError(null);
    }
  };

  return (
    <>
      <Layout style={styles.container}>
        <View style={styles.topRow}>
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
          <TouchableOpacity
            style={styles.topRowClose}
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

        {scanningReceipt && (
          <View style={styles.scanOverlay}>
            <ActivityIndicator size="large" color="#07a3e4" />
            <Text style={styles.scanOverlayText}>Analizando ticket...</Text>
          </View>
        )}

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
            {movementType === 'EXPENSE' && !isRecurring && (
              <TouchableOpacity
                onPress={onScanReceipt}
                style={styles.amountScanButton}
                disabled={scanningReceipt}
              >
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          {amountError && <Text style={styles.errorText}>{amountError}</Text>}

          <>
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
          </>

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

          <Text style={styles.label}>
            {movementType === 'EXPENSE' ? 'Categoría y tipo *' : 'Categoría *'}
          </Text>
          <View
            style={[styles.categoryTypeCard, categoryError ? styles.categoryTypeCardError : null]}
          >
            <TouchableOpacity style={styles.categorySelector} onPress={() => setModalVisible(true)}>
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

            {movementType === 'EXPENSE' && (
              <>
                <View style={styles.categoryTypeDivider} />
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      selectedExpenseType === 'FIXED' && styles.typeChipActive,
                    ]}
                    onPress={() => {
                      setSelectedExpenseType('FIXED');
                      setShowInferredNotice(false);
                    }}
                  >
                    <Ionicons
                      name="pin-outline"
                      size={14}
                      color={selectedExpenseType === 'FIXED' ? '#07a3e4' : '#6B8299'}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        selectedExpenseType === 'FIXED' && styles.typeChipTextActive,
                      ]}
                    >
                      Fijo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      selectedExpenseType === 'VARIABLE' && styles.typeChipActive,
                    ]}
                    onPress={() => {
                      setSelectedExpenseType('VARIABLE');
                      setShowInferredNotice(false);
                    }}
                  >
                    <Ionicons
                      name="trending-up"
                      size={14}
                      color={selectedExpenseType === 'VARIABLE' ? '#07a3e4' : '#6B8299'}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        selectedExpenseType === 'VARIABLE' && styles.typeChipTextActive,
                      ]}
                    >
                      Variable
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          {categoryError && <Text style={styles.errorText}>{categoryError}</Text>}

          {movementType === 'EXPENSE' && (
            <>
              <InferredRuleBanner isVisible={showInferredNotice} />
              <CategoryRuleSuggestion
                movementType={movementType}
                selectedCategory={selectedCategory}
                selectedExpenseType={selectedExpenseType}
                onAcceptSuggestion={handleAcceptRuleSuggestion}
              />
            </>
          )}

          {!isRecurring && (
            <>
              <Text style={styles.label}>Fecha *</Text>
              <View style={styles.dateChipsRow}>
                <TouchableOpacity
                  style={[styles.dateChip, isToday && styles.dateChipActive]}
                  onPress={() => setSelectedDate(today)}
                >
                  <Text style={[styles.dateChipText, isToday && styles.dateChipTextActive]}>
                    Hoy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateChip, isYesterday && styles.dateChipActive]}
                  onPress={() => setSelectedDate(yesterday)}
                >
                  <Text style={[styles.dateChipText, isYesterday && styles.dateChipTextActive]}>
                    Ayer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateChipCustom, isCustomDate && styles.dateChipActive]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={isCustomDate ? '#07a3e4' : '#6B8299'}
                  />
                  <Text
                    style={[styles.dateChipText, isCustomDate && styles.dateChipTextActive]}
                    numberOfLines={1}
                  >
                    {isCustomDate ? formatDate(selectedDate) : 'Otra'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.recurringSwitchRow}>
            <Text style={styles.recurringSwitchLabel}>
              {movementType === 'EXPENSE'
                ? '¿Es un gasto recurrente?'
                : '¿Es un ingreso recurrente?'}
            </Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: '#D7E2EC', true: '#07a3e4' }}
              thumbColor="#ffffff"
              ios_backgroundColor="#D7E2EC"
            />
          </View>

          {isRecurring && (
            <View style={styles.recurringSubPanel}>
              <View style={styles.subPanelHeader}>
                <Ionicons name="repeat" size={16} color="#07a3e4" />
                <Text style={styles.subPanelHeaderText}>Recurrente</Text>
                <TouchableOpacity
                  style={styles.subPanelInfoButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() =>
                    alert({
                      title: 'Movimiento recurrente',
                      message:
                        'Se va a registrar automáticamente a partir de la fecha de inicio (inclusive), con la frecuencia que elijas.',
                    })
                  }
                >
                  <Ionicons name="information-circle-outline" size={16} color="#07a3e4" />
                </TouchableOpacity>
              </View>

              <View style={styles.subRow}>
                <Ionicons name="sync-outline" size={18} color="#37618A" style={styles.subRowIcon} />
                <Text style={styles.subRowLabel}>Frecuencia</Text>
                <View style={styles.segmented}>
                  <TouchableOpacity
                    style={[styles.segment, frequency === 'WEEKLY' && styles.segmentActive]}
                    onPress={() => setFrequency('WEEKLY')}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        frequency === 'WEEKLY' && styles.segmentTextActive,
                      ]}
                    >
                      Semanal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segment, frequency === 'MONTHLY' && styles.segmentActive]}
                    onPress={() => setFrequency('MONTHLY')}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        frequency === 'MONTHLY' && styles.segmentTextActive,
                      ]}
                    >
                      Mensual
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.subRowDivider} />

              <TouchableOpacity style={styles.subRow} onPress={() => setShowDatePicker(true)}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#37618A"
                  style={styles.subRowIcon}
                />
                <Text style={styles.subRowLabel}>Inicia</Text>
                <View style={styles.datePill}>
                  <Text style={styles.datePillText}>{formatDate(selectedDate)}</Text>
                  <Ionicons name="chevron-down" size={16} color="#07a3e4" />
                </View>
              </TouchableOpacity>
            </View>
          )}
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

      <DatePickerModal
        visible={showDatePicker}
        date={selectedDate}
        max={isRecurring ? undefined : new Date()}
        onSelect={onDateSelect}
        onClose={() => setShowDatePicker(false)}
      />

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={onImageCaptured}
      />

      <CategoryRuleModal
        visible={suggestRuleModal.visible}
        scale={suggestRuleModal.scale}
        opacity={suggestRuleModal.opacity}
        onClose={suggestRuleModal.close}
        rule={suggestedRuleData}
        onSave={handleSaveSuggestedRule}
        saving={ruleSaving}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: vh * 2,
  },
  topRowClose: {
    padding: 4,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 4,
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
  inferredBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4FA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d0e9f5',
    alignSelf: 'flex-start',
  },
  inferredBannerText: {
    fontSize: 12,
    color: '#013366',
    fontWeight: '500',
  },
  addDescriptionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: vh * 1.2,
    paddingVertical: 4,
  },
  addDescriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#07a3e4',
  },
  recurringSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: vh * 1.5,
  },
  recurringSwitchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003366',
  },
  recurringSubPanel: {
    marginTop: vh * 1,
    backgroundColor: '#F4FAFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7EAF7',
    borderLeftWidth: 3,
    borderLeftColor: '#07a3e4',
    paddingHorizontal: 12,
    paddingVertical: vh * 0.6,
  },
  subPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: vh * 0.8,
  },
  subPanelHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#07a3e4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subPanelInfoButton: {
    marginLeft: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vh * 1,
  },
  subRowIcon: {
    marginRight: 10,
  },
  subRowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#37618A',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: RECURRENCE_CONTROL_WIDTH,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D7EAF7',
  },
  datePillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
  },
  subRowDivider: {
    height: 1,
    backgroundColor: '#E1ECF5',
  },
  segmented: {
    flexDirection: 'row',
    width: RECURRENCE_CONTROL_WIDTH,
    backgroundColor: '#E4EEF6',
    borderRadius: 9,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#506E96',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B8299',
  },
  segmentTextActive: {
    color: '#07a3e4',
  },
});

const styles = { ...tStyles, ...localStyles };

export default AddMovementScreen;
