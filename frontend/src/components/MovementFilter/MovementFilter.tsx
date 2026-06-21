import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export type FilterKind = 'day' | 'month' | 'year' | 'all';
export type MovementTypeFilter = 'all' | 'income' | 'expense';

export interface FilterState {
  kind: FilterKind;
  day: Date;
  month: number;
  year: number;
  movementType: MovementTypeFilter;
}

interface MovementFilterProps {
  onChange: (state: FilterState) => void;
  initialKind?: FilterKind;
  initialDay?: Date;
  initialMonth?: number;
  initialYear?: number;
  initialMovementType?: MovementTypeFilter;
  hideMovementTypeFilter?: boolean;
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
        <Text style={styles.dropdownTriggerText}>{selected?.label ?? ''}</Text>
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
  const [isDayPickerVisible, setIsDayPickerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sheetAnim] = useState(() => new Animated.Value(0));
  const [draftFilterIndex, setDraftFilterIndex] = useState(filterIndex);
  const [draftDay, setDraftDay] = useState(selectedDay);
  const [draftMonth, setDraftMonth] = useState(selectedMonth);
  const [draftYear, setDraftYear] = useState(selectedYear);
  const [openDropdown, setOpenDropdown] = useState<'filter' | 'month' | 'year' | null>(null);

  const years = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  }, [now]);

  const monthOptions = useMemo(
    () => MONTH_LABELS.map((label, index) => ({ key: String(index + 1), label })),
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
    });
  }, [filterIndex, selectedDay, selectedMonth, selectedYear, movementType, onChange]);

  const toggleDropdown = (dropdown: 'filter' | 'month' | 'year') => {
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

  const draftKind = FILTER_OPTIONS[draftFilterIndex].key;

  const openModal = () => {
    setDraftFilterIndex(filterIndex);
    setDraftDay(selectedDay);
    setDraftMonth(selectedMonth);
    setDraftYear(selectedYear);
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
    setOpenDropdown(null);
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setIsDayPickerVisible(false);
    });
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
          <TouchableOpacity onPress={openModal} style={styles.filterButton}>
            <SvgXml xml={FILTER_ICON} width={18} height={18} />
            <Text style={styles.filterButtonText}>Filtros</Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Ver por</Text>
              <InlineDropdown
                options={FILTER_OPTIONS}
                selectedKey={draftKind}
                onSelect={handleFilterSelect}
                isOpen={openDropdown === 'filter'}
                onToggle={() => toggleDropdown('filter')}
              />
            </View>

            <View style={styles.modalRow}>
              {draftKind === 'day' && (
                <>
                  <Text style={styles.modalLabel}>Día</Text>
                  <TouchableOpacity
                    onPress={() => setIsDayPickerVisible(true)}
                    style={styles.modalPickerButton}
                  >
                    <Text>{draftDay.toLocaleDateString('es-AR')}</Text>
                  </TouchableOpacity>
                </>
              )}

              {draftKind === 'month' && (
                <>
                  <Text style={styles.modalLabel}>Mes</Text>
                  <InlineDropdown
                    options={monthOptions}
                    selectedKey={String(draftMonth)}
                    onSelect={handleMonthSelect}
                    isOpen={openDropdown === 'month'}
                    onToggle={() => toggleDropdown('month')}
                  />
                </>
              )}

              {draftKind === 'year' && (
                <>
                  <Text style={styles.modalLabel}>Año</Text>
                  <InlineDropdown
                    options={yearOptions}
                    selectedKey={String(draftYear)}
                    onSelect={handleYearSelect}
                    isOpen={openDropdown === 'year'}
                    onToggle={() => toggleDropdown('year')}
                  />
                </>
              )}

              {draftKind === 'all' && <View style={styles.modalPlaceholder} />}
            </View>

            <View style={styles.modalRow}>
              {draftKind === 'month' && (
                <>
                  <Text style={styles.modalLabel}>Año</Text>
                  <InlineDropdown
                    options={yearOptions}
                    selectedKey={String(draftYear)}
                    onSelect={handleYearSelect}
                    isOpen={openDropdown === 'year'}
                    onToggle={() => toggleDropdown('year')}
                  />
                </>
              )}

              {draftKind !== 'month' && <View style={styles.modalPlaceholder} />}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={saveModal} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Guardar</Text>
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
  filterButtonText: {
    color: '#003366',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh * 2,
    paddingBottom: vh * 3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh * 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },
  modalClose: {
    fontSize: 20,
    color: '#003366',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: screenWidth * 0.03,
    marginBottom: vh * 1.6,
  },
  modalLabel: {
    width: screenWidth * 0.2,
    height: vh * 5.2,
    textAlignVertical: 'center',
    lineHeight: vh * 5.2,
    color: '#003366',
    fontWeight: '600',
    fontSize: 14,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownTrigger: {
    minHeight: vh * 5.2,
    backgroundColor: '#F5F8FA',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dropdownTriggerText: {
    color: '#003366',
    fontSize: 14,
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e4e9f2',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
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
    color: '#003366',
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: '#07a3e4',
    fontWeight: '700',
  },
  modalPickerButton: {
    flex: 1,
    height: vh * 5.2,
    backgroundColor: '#F5F8FA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPlaceholder: {
    flex: 1,
    height: vh * 5.2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: vh,
  },
  saveButton: {
    backgroundColor: '#1a9e5c',
    paddingHorizontal: screenWidth * 0.08,
    paddingVertical: vh * 1.2,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default MovementFilter;
