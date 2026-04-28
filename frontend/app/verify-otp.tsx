import OtpVerificationScreen from '../src/screens/OtpVerificationScreen';

export default function VerifyOtp() {
  return <OtpVerificationScreen navigation={undefined} />; // navigation prop is no longer needed with expo-router
}
