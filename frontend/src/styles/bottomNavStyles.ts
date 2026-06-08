import { StyleSheet, Platform } from 'react-native';

export const bottomNavStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 65,
    position: 'relative',
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFBB00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Elevation effect
    ...Platform.select({
      ios: {
        shadowColor: '#3a9fc0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperInactive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default bottomNavStyles;
