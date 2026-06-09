import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export const recurringIncomeStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh * 1.5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFBB00',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0c2b52',
  },
  listContent: {
    paddingBottom: vh * 3,
    gap: vh * 1.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: vh * 2,
    shadowColor: '#506E96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a9e5c',
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vh * 1.5,
  },
  metaLabel: {
    fontSize: 13,
    color: '#666',
  },
  metaValue: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '500',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#d4f0e0',
  },
  badgePaused: {
    backgroundColor: '#eceff1',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#1a9e5c',
  },
  badgeTextPaused: {
    color: '#607d8b',
  },
  toggleLink: {
    marginTop: vh * 1.5,
    alignSelf: 'flex-start',
  },
  toggleLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#07a3e4',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: vh * 8,
    paddingHorizontal: screenWidth * 0.1,
  },
  emptyText: {
    fontSize: 15,
    color: '#607d8b',
    textAlign: 'center',
    marginTop: vh * 1.5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
