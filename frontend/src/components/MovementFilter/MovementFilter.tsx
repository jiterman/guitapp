import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export type FilterKind = 'day' | 'month' | 'year' | 'all';

export interface FilterState {
  kind: FilterKind;
  day: Date;
  month: number;
  year: number;
}

interface MovementFilterProps {
  onChange: (state: FilterState) => void;
  initialKind?: FilterKind;
  initialDay?: Date;
  initialMonth?: number;
  initialYear?: number;
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
  initialKind = 'day',
  initialDay = new Date(),
  initialMonth,
  initialYear,
}) => {
  const now = new Date();
  const isCompact = screenWidth < 360;
  const [filterIndex, setFilterIndex] = useState(() =>
    Math.max(
      FILTER_OPTIONS.findIndex(option => option.key === initialKind),
      0
    )
  );
  const [selectedDay, setSelectedDay] = useState<Date>(initialDay);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear ?? now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    initialMonth ?? now.getMonth() + 1
  );
  const [isDayPickerVisible, setIsDayPickerVisible] = useState(false);

  const years = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  }, [now]);

  const monthIndex = useMemo(() => new IndexPath(selectedMonth - 1), [selectedMonth]);
  const yearIndex = useMemo(() => {
    const idx = Math.max(years.indexOf(selectedYear), 0);
    return new IndexPath(idx);
  }, [selectedYear, years]);
  const filterIndexPath = useMemo(() => new IndexPath(filterIndex), [filterIndex]);

  useEffect(() => {
    onChange({
      kind: FILTER_OPTIONS[filterIndex].key,
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
    });
  }, [filterIndex, selectedDay, selectedMonth, selectedYear, onChange]);

  const handleFilterSelect = (index: IndexPath | IndexPath[]) => {
    const idx = Array.isArray(index) ? index[0].row : index.row;
    setFilterIndex(idx);
  };

  const onDayChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      setSelectedDay(date);
    }

    if (Platform.OS === 'android') {
      setIsDayPickerVisible(false);
    }
  };

  const handleMonthSelect = (index: IndexPath | IndexPath[]) => {
    const idx = Array.isArray(index) ? index[0].row : index.row;
    setSelectedMonth(idx + 1);
  };

  const handleYearSelect = (index: IndexPath | IndexPath[]) => {
    const idx = Array.isArray(index) ? index[0].row : index.row;
    setSelectedYear(years[idx]);
  };

  const activeKind = FILTER_OPTIONS[filterIndex].key;

  return (
    <View style={styles.filterContainer}>
      <View style={styles.selectorRow}>
        <View style={styles.leftSelector}>
          <Select
            value={FILTER_OPTIONS[filterIndex].label}
            selectedIndex={filterIndexPath}
            onSelect={handleFilterSelect}
            style={styles.filterSelect}
          >
            {FILTER_OPTIONS.map(option => (
              <SelectItem key={option.key} title={option.label} />
            ))}
          </Select>
        </View>

        <View style={styles.rightSelector}>
          {activeKind === 'day' && (
            <TouchableOpacity
              onPress={() => setIsDayPickerVisible(true)}
              style={styles.pickerButton}
            >
              <Text>{selectedDay.toLocaleDateString('es-AR')}</Text>
            </TouchableOpacity>
          )}

          {activeKind === 'month' && (
            <View style={isCompact ? styles.monthYearColumn : styles.monthYearRow}>
              <Select
                value={MONTH_LABELS[selectedMonth - 1]}
                selectedIndex={monthIndex}
                onSelect={handleMonthSelect}
                style={styles.selectControl}
              >
                {MONTH_LABELS.map(label => (
                  <SelectItem key={label} title={label} />
                ))}
              </Select>
              <Select
                value={String(selectedYear)}
                selectedIndex={yearIndex}
                onSelect={handleYearSelect}
                style={styles.selectControl}
              >
                {years.map(year => (
                  <SelectItem key={year} title={String(year)} />
                ))}
              </Select>
            </View>
          )}

          {activeKind === 'year' && (
            <Select
              value={String(selectedYear)}
              selectedIndex={yearIndex}
              onSelect={handleYearSelect}
              style={styles.selectControl}
            >
              {years.map(year => (
                <SelectItem key={year} title={String(year)} />
              ))}
            </Select>
          )}

          {activeKind === 'all' && (
            <View style={styles.allHintContainer} />
          )}
        </View>
      </View>

      {isDayPickerVisible && (
        <DateTimePicker
          mode="date"
          value={selectedDay}
          display="spinner"
          onChange={onDayChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: vh * 2,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSelector: {
    flex: 1,
    marginLeft: screenWidth * 0.03,
    minHeight: vh * 5.2,
  },
  filterSelect: {
    width: screenWidth * 0.28,
    height: vh * 5.2,
    backgroundColor: '#F5F8FA',
    borderRadius: 8,
    borderColor: 'transparent',
  },
  pickerButton: {
    height: vh * 5.2,
    paddingHorizontal: screenWidth * 0.03,
    backgroundColor: '#F5F8FA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearRow: {
    flexDirection: 'row',
    gap: screenWidth * 0.02,
  },
  monthYearColumn: {
    flexDirection: 'column',
    gap: vh * 1,
  },
  selectControl: {
    flex: 1,
    height: vh * 5.2,
    backgroundColor: '#F5F8FA',
    borderRadius: 8,
    borderColor: 'transparent',
  },
  allHintContainer: {
    height: vh * 5.2,
  },
});

export default MovementFilter;
