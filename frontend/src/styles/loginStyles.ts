import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const logoSize = Math.min(screenWidth * 0.6, screenHeight * 0.35);
const vh = screenHeight / 100;

export const loginStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F2FC', // Light blue background matching mockup
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: vh * 2,
    backgroundColor: '#E6F2FC',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: logoSize,
    height: logoSize,
  },
  title: {
    color: '#003366',
    fontWeight: 'bold',
    marginBottom: vh * 0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#006699',
    marginBottom: vh * 2,
    textAlign: 'center',
    fontSize: 18,
  },
  otpVerificationSubtitle: {
    color: '#006699',
    marginBottom: vh * 1,
    textAlign: 'center',
    fontSize: 18,
  },
  emailSubtitle: {
    color: '#006699',
    marginBottom: vh * 2,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: vh * 2.5,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    color: '#003366',
    fontWeight: '600',
    marginBottom: vh * 0.5,
    marginTop: vh * 1,
    fontSize: 16,
  },
  input: {
    width: '100%',
    marginBottom: vh * 0.5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  inputText: {
    fontSize: 16,
  },
  errorText: {
    color: '#FF3333',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 5,
  },
  forgotPasswordLink: {
    color: '#0088CC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFBB00',
    borderColor: '#FFBB00',
    paddingVertical: vh * 1.2,
    marginTop: vh * 2,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#0088CC',
    fontSize: 16,
  },
  footerLink: {
    color: '#0088CC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerLinkContainer: {
    marginTop: vh * 2.5,
  },
  biometricButton: {
    marginTop: vh * 2,
    alignItems: 'center',
    paddingVertical: vh * 1.2,
  },
  biometricText: {
    color: '#006699',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: vh * 3,
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: vh * 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
  },
  userEmail: {
    fontSize: 13,
    color: '#006699',
  },
  hint: {
    color: '#5588aa',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: vh * 2,
    lineHeight: 18,
  },
});
