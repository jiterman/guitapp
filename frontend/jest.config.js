module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@ui-kitten/components|@eva-design/eva|@ui-kitten/eva-icons|expo-router|react-native-gifted-charts|gifted-charts-core|react-native-linear-gradient)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
