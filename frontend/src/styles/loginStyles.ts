import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const logoSize = Math.min(screenWidth * 0.45, screenHeight * 0.25);
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
    marginBottom: vh * 1.5,
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
});
