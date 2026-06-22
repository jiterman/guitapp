import React, { useRef } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, NativeDateService, Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { TranslationWidth, type I18nConfig } from '@ui-kitten/components/ui/calendar/i18n/type';

const i18n: I18nConfig = {
  dayNames: {
    [TranslationWidth.SHORT]: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
    [TranslationWidth.LONG]: [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ],
  },
  monthNames: {
    [TranslationWidth.SHORT]: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
    [TranslationWidth.LONG]: [
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
    ],
  },
};

// Spanish-localized date service shared across renders so the Calendar reuses it.
const dateService = new NativeDateService('es', { i18n, startDayOfWeek: 1 });

// Calendar width scales with the screen but is clamped so it never gets cramped or oversized.
const { width: screenWidth } = Dimensions.get('window');
const CALENDAR_WIDTH = Math.max(250, Math.min(screenWidth * 0.77, 320));

interface DatePickerModalProps {
  visible: boolean;
  /** Currently selected date. */
  date: Date;
  /** Latest date the user is allowed to pick. */
  max?: Date;
  /** Earliest date the user is allowed to pick. */
  min?: Date;
  title?: string;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  date,
  max,
  min,
  title = 'Elegí una fecha',
  onSelect,
  onClose,
}) => {
  const calendarRef = useRef<Calendar<Date>>(null);

  // Only scrolls the calendar back to the current month; it does not select today.
  const handleGoToToday = () => {
    calendarRef.current?.scrollToToday();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <View style={styles.headerIcon}>
                <Ionicons name="calendar-outline" size={18} color="#07a3e4" />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.todayChip} onPress={handleGoToToday} hitSlop={6}>
                <Ionicons name="refresh-outline" size={14} color="#07a3e4" />
                <Text style={styles.todayChipText}>Hoy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color="#90A4AE" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarPanel}>
            <Calendar
              ref={calendarRef}
              style={styles.calendar}
              date={date}
              min={min}
              max={max}
              dateService={dateService}
              onSelect={selected => {
                onSelect(selected);
                onClose();
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 12,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#EAF4FF',
  },
  todayChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#07a3e4',
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
  },
  // Tinted frame so the (otherwise all-white) calendar grid stands out from the card.
  calendarPanel: {
    backgroundColor: '#F4FAFE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCEBF7',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // Screen-relative width (clamped) keeps the day grid compact across device sizes.
  calendar: {
    width: CALENDAR_WIDTH,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});

export default DatePickerModal;
