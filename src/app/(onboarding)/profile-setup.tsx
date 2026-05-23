import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Gradient } from '../../design-system/primitives/Gradient';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { UserAvatar } from '../../components/common/UserAvatar';
import { radius } from '../../design-system/tokens/radius';

export default function ProfileSetupScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [avatarSeed, setAvatarSeed] = useState(user?.username || 'dayzo');
  const [loading, setLoading] = useState(false);

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/png?seed=${avatarSeed}`;

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await api.patch('/users/profile', {
        avatar: avatarUrl,
      });
      
      updateUser(res.data);
      router.push('/(onboarding)/notifications');
    } catch (e) {
      console.warn('Failed to update avatar:', e);
      // fallback
      router.push('/(onboarding)/notifications');
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
          <View style={[styles.stepDot, styles.activeStepDot, { backgroundColor: colors.primary }]} />
        </View>

        <Spacer size="lg" />

        <View style={styles.titleSection}>
          <Text variant="h1" weight="display" color={colors.text}>
            Calibrate Identity
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" color={colors.textSecondary}>
            Configure your avatar visual tag using bot generator seeds.
          </Text>
        </View>

        <Spacer size="xl" />

        <GlassCard borderRadius="2xl" style={styles.card}>
          <View style={styles.avatarWrapper}>
            <UserAvatar uri={avatarUrl} username={user?.username || 'U'} size="xl" borderRankColor={colors.primary} />
          </View>

          <Spacer size="xl" />

          <Text variant="bodySmall" weight="bold" color={colors.textSecondary}>
            Custom Avatar Seed
          </Text>
          <Spacer size="xs" />
          <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
            <TextInput
              placeholder="Type anything to randomize"
              placeholderTextColor={colors.textTertiary}
              value={avatarSeed}
              onChangeText={setAvatarSeed}
              autoCapitalize="none"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Spacer size="lg" />
          
          <Text variant="caption" color={colors.textTertiary} align="center">
            Your avatar automatically morphs based on your typed word seed! Try typing your name.
          </Text>
        </GlassCard>

        <Spacer size="2xl" />

        <AnimatedButton
          title="Continue"
          onPress={handleSaveProfile}
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
  activeStepDot: {
    width: 48,
  },
  titleSection: {
    alignItems: 'flex-start',
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    padding: 0,
    textAlign: 'center',
  },
});
