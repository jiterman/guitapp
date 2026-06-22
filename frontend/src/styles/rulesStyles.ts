import { StyleSheet } from 'react-native';
import { profileColors } from './profileStyles';

export const rulesColors = {
  background: profileColors.background || '#F4F7FA',
  primaryText: '#003366',
  accentPurple: '#8A4FFF',
  blockBg: '#F4F9FD',
  blockBorder: '#e0edf6',
  inputBorder: '#c8dff0',
  inputBg: '#fff',
  accentBlue: '#07a3e4',
  textMuted: '#6b8aa1',
  btnYellow: '#FFBB00',
  btnYellowText: '#0c2b52',
  errorText: '#FF3D71',
};

// ESTILOS EXCLUSIVOS DE LA PANTALLA (Screen Styles)
export const rulesScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rulesColors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: rulesColors.primaryText,
  },
  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: 'rgba(7,163,228,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: rulesColors.accentBlue,
  },
  subtitle: {
    fontSize: 13,
    color: rulesColors.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  separator: {
    height: 10,
  },
  listPadding: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(7,163,228,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: rulesColors.primaryText,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: rulesColors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: rulesColors.background,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  footerButton: {
    backgroundColor: rulesColors.accentBlue,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: rulesColors.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

// ESTILOS EXCLUSIVOS DEL MODAL (Modal Styles)
export const rulesModalStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: rulesColors.primaryText,
  },
  editBlock: {
    backgroundColor: rulesColors.blockBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: rulesColors.blockBorder,
  },
  inputRow: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: rulesColors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputDivider: {
    height: 1,
    backgroundColor: rulesColors.blockBorder,
    marginVertical: 14,
  },
  saveButton: {
    backgroundColor: rulesColors.btnYellow,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: rulesColors.btnYellowText,
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    maxHeight: 160,
    backgroundColor: rulesColors.inputBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: rulesColors.inputBorder,
    padding: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  categoryOptionActive: {
    backgroundColor: rulesColors.blockBg,
  },
  categoryLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: rulesColors.primaryText,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: rulesColors.accentBlue,
    fontWeight: '700',
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: rulesColors.inputBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: rulesColors.inputBorder,
    padding: 4,
    gap: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: rulesColors.blockBg,
    borderWidth: 1,
    borderColor: rulesColors.inputBorder,
  },
  typeButtonInactive: {
    backgroundColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: rulesColors.accentBlue,
  },
  typeButtonTextInactive: {
    color: rulesColors.textMuted,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 12,
    gap: 6,
  },
  errorText: {
    color: rulesColors.errorText,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
