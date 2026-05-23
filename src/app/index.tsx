import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../design-system/theme/ThemeProvider';

export default function RootIndexGuard() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated, initialize, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await initialize();
      } catch (e) {
        console.warn('Auth initialization failed:', e);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      // If user is authenticated, check if they have onboarded (completed setup)
      // We check if they have set an avatar or selected interests.
      // If user has xp, we consider them onboarded, or if avatar is set.
      const hasOnboarded = user && user.xp !== undefined && user.xp > 0;
      if (hasOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [loading, isAuthenticated, user]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
