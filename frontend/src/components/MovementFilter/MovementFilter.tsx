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
} from 'react-native';
import { Text, Select, SelectItem, IndexPath } from '@ui-kitten/components';
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

  const years = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  }, [now]);

  const draftFilterIndexPath = useMemo(() => new IndexPath(draftFilterIndex), [draftFilterIndex]);
  const draftMonthIndex = useMemo(() => new IndexPath(draftMonth - 1), [draftMonth]);
  const draftYearIndex = useMemo(() => {
    const idx = Math.max(years.indexOf(draftYear), 0);
    return new IndexPath(idx);
  }, [draftYear, years]);

  useEffect(() => {
    onChange({
      kind: FILTER_OPTIONS[filterIndex].key,
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
      movementType,
    });
  }, [filterIndex, selectedDay, selectedMonth, selectedYear, movementType, onChange]);

  const handleFilterSelect = (index: IndexPath | IndexPath[]) => {
    const idx = Array.isArray(index) ? index[0].row : index.row;
    setDraftFilterIndex(idx);
  };

  const handleMonthSelect = (index: IndexPath | IndexPath[]) => {
    const idx = Array.isArray(index) ? index[0].row : index.row;
    setDraftMonth(idx + 1);
  };

  const handleYearSelect = (index: IndexPath | IndexPath[]) => {
    const idx = Array.isArray(index) ? index[0].row : index.row;
    setDraftYear(years[idx]);
  };

  const draftKind = FILTER_OPTIONS[draftFilterIndex].key;

  const openModal = () => {
    setDraftFilterIndex(filterIndex);
    setDraftDay(selectedDay);
    setDraftMonth(selectedMonth);
    setDraftYear(selectedYear);
    setIsModalVisible(true);
  };

  const closeModal = () => {
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
              <Select
                value={FILTER_OPTIONS[draftFilterIndex].label}
                selectedIndex={draftFilterIndexPath}
                onSelect={handleFilterSelect}
                style={styles.modalSelect}
              >
                {FILTER_OPTIONS.map(option => (
                  <SelectItem key={option.key} title={option.label} />
                ))}
              </Select>
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
                  <Select
                    value={MONTH_LABELS[draftMonth - 1]}
                    selectedIndex={draftMonthIndex}
                    onSelect={handleMonthSelect}
                    style={styles.modalSelect}
                  >
                    {MONTH_LABELS.map(label => (
                      <SelectItem key={label} title={label} />
                    ))}
                  </Select>
                </>
              )}

              {draftKind === 'year' && (
                <>
                  <Text style={styles.modalLabel}>Año</Text>
                  <Select
                    value={String(draftYear)}
                    selectedIndex={draftYearIndex}
                    onSelect={handleYearSelect}
                    style={styles.modalSelect}
                  >
                    {years.map(year => (
                      <SelectItem key={year} title={String(year)} />
                    ))}
                  </Select>
                </>
              )}

              {draftKind === 'all' && <View style={styles.modalPlaceholder} />}
            </View>

            <View style={styles.modalRow}>
              {draftKind === 'month' && (
                <>
                  <Text style={styles.modalLabel}>Año</Text>
                  <Select
                    value={String(draftYear)}
                    selectedIndex={draftYearIndex}
                    onSelect={handleYearSelect}
                    style={styles.modalSelect}
                  >
                    {years.map(year => (
                      <SelectItem key={year} title={String(year)} />
                    ))}
                  </Select>
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
    alignItems: 'center',
    gap: screenWidth * 0.03,
    marginBottom: vh * 1.6,
  },
  modalLabel: {
    width: screenWidth * 0.2,
    color: '#003366',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSelect: {
    flex: 1,
    height: vh * 5.2,
    backgroundColor: '#F5F8FA',
    borderRadius: 8,
    borderColor: 'transparent',
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
