import { StyleSheet, Dimensions } from 'react-native';
import { profileColors } from './profileStyles';

const { height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

export const notificationChannelStyles = StyleSheet.create({
  block: {
    backgroundColor: '#F4F9FD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0edf6',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#c8dff0',
    paddingHorizontal: 14,
    paddingVertical: vh * 1.6,
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: '#07a3e4',
    backgroundColor: '#E6F2FC',
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F2FC',
  },
  optionTextContainer: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: profileColors.navy,
  },
  optionSubtitle: {
    fontSize: 13,
    color: profileColors.muted,
  },
  hint: {
    fontSize: 12,
    color: profileColors.muted,
    marginBottom: 12,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#FFBB00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0c2b52',
    fontWeight: '700',
    fontSize: 14,
  },
});
