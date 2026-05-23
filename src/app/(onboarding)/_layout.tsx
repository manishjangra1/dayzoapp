import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../design-system/theme/ThemeProvider';

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
