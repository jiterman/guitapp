import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SvgXml } from 'react-native-svg';
import FILTER_ICON from '../../../assets/icons/filterIcon';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export type FilterKind = 'day' | 'month' | 'year' | 'all';
export type MovementTypeFilter = 'all' | 'income' | 'expense';
export type ExpenseTypeFilter = 'all' | 'FIXED' | 'VARIABLE';

type DropdownKey = 'filter' | 'month' | 'year' | 'category' | 'expenseType' | null;

export interface FilterState {
  kind: FilterKind;
  day: Date;
  month: number;
  year: number;
  movementType: MovementTypeFilter;
  // Selected category values. Empty array means "all categories".
  categories?: string[];
  expenseType?: ExpenseTypeFilter;
  search?: string;
}

interface MovementFilterProps {
  onChange: (state: FilterState) => void;
  initialKind?: FilterKind;
  initialDay?: Date;
  initialMonth?: number;
  initialYear?: number;
  initialMovementType?: MovementTypeFilter;
  hideMovementTypeFilter?: boolean;
  // Enables the search bar plus the category and expense-type filters. Off by
  // default so existing consumers (summary, charts) keep their simpler layout.
  showAdvancedFilters?: boolean;
  externalModalVisible?: boolean;
  onExternalModalClose?: () => void;
}

const FILTER_OPTIONS: { key: FilterKind; label: string }[] = [
  { key: 'day', label: 'Día' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Año' },
  { key: 'all', label: 'Todo' },
];

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

// Combined, de-duplicated category list (income + expense share some values
// like OTHER). Used by the multi-select category filter dropdown.
const CATEGORY_OPTIONS: { key: string; label: string }[] = (() => {
  const seen = new Map<string, string>();
  [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].forEach(category => {
    if (!seen.has(category.value)) {
      seen.set(category.value, category.label);
    }
  });
  return Array.from(seen, ([key, label]) => ({ key, label }));
})();

const EXPENSE_TYPE_OPTIONS: { key: ExpenseTypeFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'FIXED', label: 'Fijo' },
  { key: 'VARIABLE', label: 'Variable' },
];

interface InlineDropdownProps {
  options: { key: string; label: string }[];
  selectedKey: string;
  onSelect: (key: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Inline expandable dropdown used instead of UI Kitten's Select, which dispatches
// a synchronous setState while measuring its Popover when rendered inside a Modal
// (triggering "Cannot update during an existing state transition"). This mirrors
// the dropdown pattern already used in CategoryRuleModal.
const InlineDropdown: React.FC<InlineDropdownProps> = ({
  options,
  selectedKey,
  onSelect,
  isOpen,
  onToggle,
}) => {
  const selected = options.find(option => option.key === selectedKey);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownTrigger} onPress={onToggle} activeOpacity={0.8}>
        <Text numberOfLines={1} style={styles.dropdownTriggerText}>
          {selected?.label ?? ''}
        </Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6b8aa1" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView
            showsVerticalScrollIndicator
            nestedScrollEnabled
            style={styles.dropdownScroll}
          >
            {options.map(option => {
              const isSelected = option.key === selectedKey;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => onSelect(option.key)}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#07a3e4" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

interface MultiSelectDropdownProps {
  options: { key: string; label: string }[];
  selectedKeys: string[];
  onToggleKey: (key: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  allLabel: string;
}

// Multi-select variant of InlineDropdown: items toggle on tap (the list stays
// open) and the trigger summarizes the current selection.
const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedKeys,
  onToggleKey,
  isOpen,
  onToggle,
  allLabel,
}) => {
  const triggerLabel = (() => {
    if (selectedKeys.length === 0) return allLabel;
    if (selectedKeys.length === 1) {
      return options.find(option => option.key === selectedKeys[0])?.label ?? allLabel;
    }
    return `${selectedKeys.length} seleccionadas`;
  })();

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownTrigger} onPress={onToggle} activeOpacity={0.8}>
        <Text style={styles.dropdownTriggerText}>{triggerLabel}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6b8aa1" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView
            showsVerticalScrollIndicator
            nestedScrollEnabled
            style={styles.dropdownScroll}
          >
            {options.map(option => {
              const isSelected = selectedKeys.includes(option.key);
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                  onPress={() => onToggleKey(option.key)}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#07a3e4" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const MovementFilter: React.FC<MovementFilterProps> = ({
  onChange,
  initialKind = 'month',
  initialDay = new Date(),
  initialMonth,
  initialYear,
  initialMovementType = 'all',
  hideMovementTypeFilter = false,
  showAdvancedFilters = false,
  externalModalVisible,
  onExternalModalClose,
}) => {
  const now = useMemo(() => new Date(), []);
  const [filterIndex, setFilterIndex] = useState(() =>
    Math.max(
      FILTER_OPTIONS.findIndex(option => option.key === initialKind),
      0
    )
  );
  const [movementType, setMovementType] = useState<MovementTypeFilter>(initialMovementType);
  const [selectedDay, setSelectedDay] = useState<Date>(initialDay);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear ?? now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth ?? now.getMonth() + 1);
  const [categories, setCategories] = useState<string[]>([]);
  const [expenseType, setExpenseType] = useState<ExpenseTypeFilter>('all');
  const [search, setSearch] = useState('');
  const [isDayPickerVisible, setIsDayPickerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sheetAnim] = useState(() => new Animated.Value(0));
  const [draftFilterIndex, setDraftFilterIndex] = useState(filterIndex);
  const [draftDay, setDraftDay] = useState(selectedDay);
  const [draftMonth, setDraftMonth] = useState(selectedMonth);
  const [draftYear, setDraftYear] = useState(selectedYear);
  const [draftCategories, setDraftCategories] = useState<string[]>(categories);
  const [draftExpenseType, setDraftExpenseType] = useState(expenseType);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);

  const years = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  }, [now]);

  const monthOptions = useMemo(
    () =>
      MONTH_LABELS.map((label, index) => ({ key: String(index + 1), label: label.slice(0, 3) })),
    []
  );
  const yearOptions = useMemo(
    () => years.map(year => ({ key: String(year), label: String(year) })),
    [years]
  );

  useEffect(() => {
    onChange({
      kind: FILTER_OPTIONS[filterIndex].key,
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
      movementType,
      categories,
      expenseType,
      search: search.trim(),
    });
  }, [
    filterIndex,
    selectedDay,
    selectedMonth,
    selectedYear,
    movementType,
    categories,
    expenseType,
    search,
    onChange,
  ]);

  const toggleDropdown = (dropdown: Exclude<DropdownKey, null>) => {
    setOpenDropdown(prev => (prev === dropdown ? null : dropdown));
  };

  const handleFilterSelect = (key: string) => {
    setDraftFilterIndex(
      Math.max(
        FILTER_OPTIONS.findIndex(option => option.key === key),
        0
      )
    );
    setOpenDropdown(null);
  };

  const handleMonthSelect = (key: string) => {
    setDraftMonth(Number(key));
    setOpenDropdown(null);
  };

  const handleYearSelect = (key: string) => {
    setDraftYear(Number(key));
    setOpenDropdown(null);
  };

  const toggleDraftCategory = (key: string) => {
    setDraftCategories(prev =>
      prev.includes(key) ? prev.filter(value => value !== key) : [...prev, key]
    );
  };

  const handleExpenseTypeSelect = (key: string) => {
    setDraftExpenseType(key as ExpenseTypeFilter);
    setOpenDropdown(null);
  };

  const draftKind = FILTER_OPTIONS[draftFilterIndex].key;

  const openModal = () => {
    setDraftFilterIndex(filterIndex);
    setDraftDay(selectedDay);
    setDraftMonth(selectedMonth);
    setDraftYear(selectedYear);
    setDraftCategories(categories);
    setDraftExpenseType(expenseType);
    setOpenDropdown(null);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setOpenDropdown(null);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setIsDayPickerVisible(false);
      if (onExternalModalClose) {
        onExternalModalClose();
      }
    });
  };

  const saveModal = () => {
    setFilterIndex(draftFilterIndex);
    setSelectedDay(draftDay);
    setSelectedMonth(draftMonth);
    setSelectedYear(draftYear);
    setCategories(draftCategories);
    setExpenseType(draftExpenseType);
    setOpenDropdown(null);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setIsDayPickerVisible(false);
      if (onExternalModalClose) {
        onExternalModalClose();
      }
    });
  };

  // Resets the draft state inside the modal back to defaults (no committed
  // change until the user taps "Guardar").
  const resetDraftFilters = () => {
    setDraftFilterIndex(
      Math.max(
        FILTER_OPTIONS.findIndex(option => option.key === initialKind),
        0
      )
    );
    setDraftDay(initialDay);
    setDraftMonth(initialMonth ?? now.getMonth() + 1);
    setDraftYear(initialYear ?? now.getFullYear());
    setDraftCategories([]);
    setDraftExpenseType('all');
    setOpenDropdown(null);
  };

  const onDraftDayChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      setDraftDay(date);
    }

    if (Platform.OS === 'android') {
      setIsDayPickerVisible(false);
    }
  };

  const toggleMovementType = (next: MovementTypeFilter) => {
    setMovementType(prev => (prev === next ? 'all' : next));
  };

  // Whether any filter differs from its default. Used to highlight the
  // "Filtros" button instead of rendering a chips row. The period (kind) is
  // considered active whenever it differs from the screen's initial kind.
  // Only highlight the Filters button for filters that live inside the modal
  // (period, category, expense type). The Income/Expense toggle and the search
  // bar are not part of the modal, so they must not flag the button as active.
  const hasActiveFilters = useMemo(
    () =>
      FILTER_OPTIONS[filterIndex].key !== initialKind ||
      categories.length > 0 ||
      expenseType !== 'all',
    [filterIndex, initialKind, categories, expenseType]
  );

  useEffect(() => {
    if (externalModalVisible !== undefined) {
      if (externalModalVisible && !isModalVisible) {
        openModal();
      } else if (!externalModalVisible && isModalVisible) {
        closeModal();
      }
    }
  }, [externalModalVisible]);

  useEffect(() => {
    if (!isModalVisible) return;
    sheetAnim.setValue(0);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isModalVisible, sheetAnim]);

  const isExternallyControlled = externalModalVisible !== undefined;

  return (
    <View style={styles.filterContainer}>
      {!isExternallyControlled && showAdvancedFilters && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6b8aa1" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar..."
            placeholderTextColor="#9bb0c1"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9bb0c1" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {!isExternallyControlled && (
        <View style={styles.actionsRow}>
          {!hideMovementTypeFilter && (
            <>
              <TouchableOpacity
                onPress={() => toggleMovementType('income')}
                style={[
                  styles.typeButton,
                  movementType === 'income' && styles.typeButtonIncomeActive,
                ]}
              >
                <Text style={[styles.typeLabel, styles.incomeText]}>Ingresos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleMovementType('expense')}
                style={[
                  styles.typeButton,
                  movementType === 'expense' && styles.typeButtonExpenseActive,
                ]}
              >
                <Text style={[styles.typeLabel, styles.expenseText]}>Gastos</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            onPress={openModal}
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          >
            <SvgXml xml={FILTER_ICON} width={18} height={18} />
            <Text
              style={[styles.filterButtonText, hasActiveFilters && styles.filterButtonTextActive]}
            >
              Filtros
            </Text>
            {hasActiveFilters && <View style={styles.filterActiveDot} />}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            onStartShouldSetResponder={() => true}
            style={[
              styles.modalSheet,
              {
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenHeight, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.grabber} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={closeModal} hitSlop={8} style={styles.modalCloseButton}>
                <Ionicons name="close" size={20} color="#6b8aa1" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Ver por</Text>
                <View style={styles.periodControls}>
                  <View
                    style={
                      draftKind === 'all' || draftKind === 'month'
                        ? styles.periodFlex
                        : styles.periodKind
                    }
                  >
                    <InlineDropdown
                      options={FILTER_OPTIONS}
                      selectedKey={draftKind}
                      onSelect={handleFilterSelect}
                      isOpen={openDropdown === 'filter'}
                      onToggle={() => toggleDropdown('filter')}
                    />
                  </View>

                  {draftKind === 'day' && (
                    <TouchableOpacity
                      onPress={() => setIsDayPickerVisible(true)}
                      style={styles.periodPickerButton}
                    >
                      <Text>{draftDay.toLocaleDateString('es-AR')}</Text>
                    </TouchableOpacity>
                  )}

                  {draftKind === 'month' && (
                    <>
                      <View style={styles.periodFlex}>
                        <InlineDropdown
                          options={monthOptions}
                          selectedKey={String(draftMonth)}
                          onSelect={handleMonthSelect}
                          isOpen={openDropdown === 'month'}
                          onToggle={() => toggleDropdown('month')}
                        />
                      </View>
                      <View style={styles.periodFlex}>
                        <InlineDropdown
                          options={yearOptions}
                          selectedKey={String(draftYear)}
                          onSelect={handleYearSelect}
                          isOpen={openDropdown === 'year'}
                          onToggle={() => toggleDropdown('year')}
                        />
                      </View>
                    </>
                  )}

                  {draftKind === 'year' && (
                    <View style={styles.periodFlex}>
                      <InlineDropdown
                        options={yearOptions}
                        selectedKey={String(draftYear)}
                        onSelect={handleYearSelect}
                        isOpen={openDropdown === 'year'}
                        onToggle={() => toggleDropdown('year')}
                      />
                    </View>
                  )}
                </View>
              </View>

              {showAdvancedFilters && (
                <>
                  <View style={styles.modalDivider} />

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Categoría</Text>
                    <MultiSelectDropdown
                      options={CATEGORY_OPTIONS}
                      selectedKeys={draftCategories}
                      onToggleKey={toggleDraftCategory}
                      isOpen={openDropdown === 'category'}
                      onToggle={() => toggleDropdown('category')}
                      allLabel="Todas"
                    />
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Tipo</Text>
                    <View style={styles.segmentedControl}>
                      {EXPENSE_TYPE_OPTIONS.map(option => {
                        const isActive = draftExpenseType === option.key;
                        return (
                          <TouchableOpacity
                            key={option.key}
                            onPress={() => handleExpenseTypeSelect(option.key)}
                            style={[
                              styles.segmentedButton,
                              isActive && styles.segmentedButtonActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.segmentedButtonText,
                                isActive && styles.segmentedButtonTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={resetDraftFilters} style={styles.resetButton}>
                <Ionicons name="refresh" size={16} color="#07a3e4" />
                <Text style={styles.resetButtonText}>Restablecer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveModal} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {isDayPickerVisible && draftKind === 'day' && (
        <DateTimePicker
          mode="date"
          value={draftDay}
          display="spinner"
          onChange={onDraftDayChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: vh * 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E6F1',
    paddingHorizontal: 12,
    minHeight: vh * 5.2,
    marginBottom: vh * 1.2,
  },
  searchInput: {
    flex: 1,
    color: '#003366',
    fontSize: 14,
    paddingVertical: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: screenWidth * 0.03,
  },
  typeButton: {
    flex: 1,
    minHeight: vh * 5.2,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E6F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  typeButtonIncomeActive: {
    borderColor: '#1a9e5c',
  },
  typeButtonExpenseActive: {
    borderColor: '#c0392b',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  incomeText: {
    color: '#1a9e5c',
  },
  expenseText: {
    color: '#c0392b',
  },
  filterButton: {
    flex: 1,
    minHeight: vh * 5.2,
    backgroundColor: '#F5F8FA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#D8E6F1',
  },
  filterButtonActive: {
    backgroundColor: '#E6F4FA',
    borderColor: '#07a3e4',
  },
  filterButtonText: {
    color: '#003366',
    fontWeight: '700',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#07a3e4',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#07a3e4',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh * 1.2,
    paddingBottom: vh * 3,
    maxHeight: vh * 85,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8E6F1',
    marginBottom: vh * 1.6,
  },
  modalScroll: {
    flexGrow: 0,
    marginHorizontal: -8,
  },
  modalScrollContent: {
    paddingHorizontal: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#EEF6FB',
    marginBottom: vh * 1.6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh * 2.4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003366',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: screenWidth * 0.03,
    marginBottom: vh * 1.8,
  },
  modalLabel: {
    width: screenWidth * 0.22,
    height: vh * 5.4,
    textAlignVertical: 'center',
    lineHeight: vh * 5.4,
    color: '#003366',
    fontWeight: '700',
    fontSize: 14,
  },
  dropdownContainer: {
    flex: 1,
  },
  segmentedControl: {
    flex: 1,
    flexDirection: 'row',
    height: vh * 5.4,
    backgroundColor: '#F5F8FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E6F1',
    padding: 4,
    gap: 4,
  },
  segmentedButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentedButtonActive: {
    backgroundColor: '#07a3e4',
  },
  segmentedButtonText: {
    color: '#6b8aa1',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentedButtonTextActive: {
    color: '#fff',
  },
  dropdownTrigger: {
    height: vh * 5.4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E6F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    paddingRight: 8,
    gap: 2,
  },
  dropdownTriggerText: {
    flexShrink: 1,
    color: '#003366',
    fontSize: 14,
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D8E6F1',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownScroll: {
    maxHeight: vh * 24,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  dropdownItemActive: {
    backgroundColor: '#E6F4FA',
  },
  dropdownItemText: {
    flexShrink: 1,
    color: '#003366',
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: '#07a3e4',
    fontWeight: '700',
  },
  periodControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: screenWidth * 0.02,
  },
  // Narrower "Ver por" dropdown (vs. flex:1) when a single dependent selector
  // sits beside it in day/year mode. Flex-based to avoid a fixed width getting
  // stuck in Yoga when the style switches back to periodFlex in month mode.
  periodKind: {
    flex: 0.7,
  },
  periodFlex: {
    flex: 1,
  },
  periodPickerButton: {
    flex: 1,
    height: vh * 5.4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E6F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vh * 1.2,
    paddingTop: vh * 1.6,
    borderTopWidth: 1,
    borderTopColor: '#EEF6FB',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: vh * 1.2,
    paddingHorizontal: screenWidth * 0.02,
  },
  resetButtonText: {
    color: '#07a3e4',
    fontWeight: '700',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#f5a623',
    paddingHorizontal: screenWidth * 0.1,
    paddingVertical: vh * 1.3,
    borderRadius: 12,
    shadowColor: '#f5a623',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonText: {
    color: '#0c2b52',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default MovementFilter;
