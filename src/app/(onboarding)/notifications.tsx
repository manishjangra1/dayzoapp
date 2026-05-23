import React, { useState } from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Sparkles, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Gradient } from '../../design-system/primitives/Gradient';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { triggerConfetti } from '../../utils/confetti';
import { radius } from '../../design-system/tokens/radius';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleFinishOnboarding = async () => {
    try {
      setLoading(true);
      // Give initial onboard gift XP to incentivize
      const res = await api.patch('/users/profile', {
        xp: 25, // First starting gift XP!
      });
      
      updateUser(res.data);
      triggerConfetti();
      
      // Navigate straight to tabs home screen!
      router.replace('/(tabs)');
    } catch (e) {
      console.warn('Failed to finish onboarding:', e);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Gradient type="midnight" style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
        </View>

        <Spacer size="lg" />

        <View style={styles.heroSection}>
          <View style={[styles.bellGlow, { backgroundColor: 'rgba(255, 75, 43, 0.15)', shadowColor: colors.primary }]}>
            <Bell size={48} color={colors.primary} />
          </View>

          <Spacer size="xl" />

          <Text variant="h1" weight="display" align="center" color={colors.text}>
            Protect Your Momentum
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" align="center" color={colors.textSecondary} style={{ paddingHorizontal: 16 }}>
            Enable atomic alerts to protect streaks, receive cooperative squad summons, and announce daily challenges.
          </Text>
        </View>

        <Spacer size="2xl" />

        <GlassCard borderRadius="xl" style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <ShieldCheck size={18} color={colors.success} />
            <Text variant="bodySmall" weight="bold" color={colors.text}>
              Anti-Distraction Policy
            </Text>
          </View>
          <Spacer size="xs" />
          <Text variant="caption" color={colors.textSecondary}>
            We never spam. You only receive one concise notification per day when the daily rotating challenge becomes available.
          </Text>
        </GlassCard>

        <Spacer size="2xl" />

        <AnimatedButton
          title="Enable Notifications & Enter"
          onPress={handleFinishOnboarding}
          loading={loading}
          borderRadius="md"
        />
      </View>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  alertCard: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
