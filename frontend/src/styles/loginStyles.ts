import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F2FC', // Light blue background matching mockup
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E6F2FC', // Matches safe area
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  title: {
    color: '#003366', // Dark blue
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#006699', // Lighter blue
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 20,
  },
  otpVerificationSubtitle: {
    color: '#006699', // Lighter blue
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  emailSubtitle: {
    color: '#006699', // Lighter blue
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
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
    marginBottom: 5,
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    width: '100%',
    marginBottom: 5, // Less margin since we have inline errors
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    //borderColor: '#99CCFF', // Light blue borders
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
  forgotPasswordText: {
    color: '#0088CC',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16,
  },
  forgotPasswordLink: {
    color: '#0088CC',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFBB00',
    borderColor: '#FFBB00',
    paddingVertical: 12,
    marginTop: 20,
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
    marginTop: 30,
  },
});
