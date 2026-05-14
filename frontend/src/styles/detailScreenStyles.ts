import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export const detailScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
    backgroundColor: '#E6F2FC',
  },
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: vh * 1.5,
  },
  backButtonTopText: {
    fontSize: 14,
    color: '#07a3e4',
    fontWeight: '400',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: vh * 0.5,
  },
  input: {
    marginBottom: vh * 2,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#003366',
    marginLeft: 8,
  },
  errorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: -vh * 1.5,
    marginBottom: vh * 1.5,
  },
  categoryErrorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: vh * 0.6,
    marginBottom: vh * 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: vh * 0.5,
    marginTop: vh * 2,
  },
  typeErrorText: {
    color: '#FF3333',
    fontSize: 13,
    marginTop: vh * 0.6,
    marginBottom: vh * 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: vh * 1.5,
    marginBottom: 0,
  },
  dropdownButtonError: {
    borderColor: '#FF3333',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#003366',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#aaa',
  },
  dropdownArrow: {
    fontSize: 11,
    color: '#006699',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: vh * 2,
  },
  typeButton: {
    flex: 1,
    paddingVertical: vh * 1.3,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  typeButtonInactive: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  typeButtonTextInactive: {
    color: '#003366',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderTopWidth: 4,
    borderTopColor: '#FFBB00',
    padding: vh * 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007dbd',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButtonEdit: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
  },
  iconButtonDelete: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vh * 2,
    borderBottomWidth: 0,
    marginBottom: vh * 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  amountContent: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: vh * 1.2,
    borderBottomWidth: 0,
    marginBottom: vh * 1.5,
  },
  detailRowWithBg: {
    borderRadius: 12,
    paddingHorizontal: vh * 1.5,
  },
  detailRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: vh * 1.2,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerGray: {
    backgroundColor: '#e8e8e8',
  },
  iconContainerBlue: {
    backgroundColor: '#cceeff',
  },
  iconContainerPurple: {
    backgroundColor: '#e8d5ff',
  },
  iconContainerGreen: {
    backgroundColor: '#d4f0e0',
  },
  iconContainerOrange: {
    backgroundColor: '#ffe8c5',
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#003366',
    fontWeight: '500',
  },
  detailValueItalic: {
    fontStyle: 'italic',
    color: '#999',
  },
  actions: {
    marginTop: vh * 2.2,
    gap: vh * 1.2,
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: vh * 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  modalClose: {
    fontSize: 18,
    color: '#006699',
  },
  searchInput: {
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    fontSize: 15,
    color: '#003366',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  categoryItemSelected: {
    backgroundColor: '#E6F2FC',
  },
  categoryIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  categoryLabel: {
    fontSize: 15,
    color: '#003366',
  },
  categoryLabelSelected: {
    color: '#006699',
    fontWeight: '600',
  },
});
