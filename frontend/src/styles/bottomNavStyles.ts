import { StyleSheet } from 'react-native';

export const bottomNavStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    backgroundColor: '#E6F2FC',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  iconWrapperInactive: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
});

export default bottomNavStyles;
