import React from 'react';
import HomeScreen from './index';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Disable Reanimated strict mode to suppress warnings triggered when component hooks are memoized by the React Compiler
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  return <HomeScreen />;
}
