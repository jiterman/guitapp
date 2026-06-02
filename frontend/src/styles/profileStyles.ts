import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export const profileLayout = {
  screenWidth,
  screenHeight,
  vh,
};

export const profileColors = {
  background: '#E6F2FC',
  white: '#fff',
  navy: '#003366',
  muted: '#6b8aa1',
  divider: '#EEF6FB',
  overlay: 'rgba(0,0,0,0.35)',
  handle: '#c8dff0',
  danger: '#FF3B30',
};

export const profileShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};

export const profileSheetShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 10,
};

export const profileSharedStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: profileColors.navy,
    marginBottom: vh,
  },

  menuCard: {
    backgroundColor: profileColors.white,
    borderRadius: 16,
    marginBottom: vh * 2.5,
    paddingVertical: vh * 0.5,
    ...profileShadow,
  },

  menuCardSplit: {
    marginVertical: -vh * 0.5,
  },

  menuCardRow: {
    minHeight: vh * 9,
    justifyContent: 'center',
  },

  menuCardDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: screenWidth * 0.04,
  },

  overlay: {
    flex: 1,
    backgroundColor: profileColors.overlay,
  },

  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: profileColors.handle,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vh * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: profileColors.divider,
    marginBottom: vh * 1.5,
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: profileColors.navy,
  },

  errorText: {
    color: profileColors.danger,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  readonly: {
    backgroundColor: '#F4F9FD',
    opacity: 0.9,
  },
});

export const profileModalStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: profileColors.white,
    borderRadius: 20,
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: vh * 0.75,
    paddingBottom: vh * 0.5,
    ...profileSheetShadow,
  },
});
