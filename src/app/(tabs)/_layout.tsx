import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { FloatingTabBar } from '../../components/navigation/FloatingTabBar';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Rankings' }} />
      <Tabs.Screen name="squads" options={{ title: 'Squads' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
