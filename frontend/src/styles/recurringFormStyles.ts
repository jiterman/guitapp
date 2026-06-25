import { StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export const RECURRENCE_CONTROL_WIDTH = 220;

export const recurringFormStyles = StyleSheet.create({
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
  subRowLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -4,
  },
  subRowIcon: {
    marginRight: 6,
  },
  subRowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37618A',
    lineHeight: 18,
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
    paddingHorizontal: 4,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6B8299',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#07a3e4',
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
});
