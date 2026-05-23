import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Award, ShieldAlert, Sparkles, UserCheck, Flame, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Surface } from '../../design-system/primitives/Surface';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Spacer } from '../../design-system/primitives/Spacer';
import { radius } from '../../design-system/tokens/radius';

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Logout Session', 'Are you sure you want to end your active Dayzo session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.borderSubtle }]}>
        <Text variant="h2" weight="bold" color={colors.text}>
          Profile
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          Your habit analytical dashboard.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Spacer size="md" />

        {/* Master Dayzo ID card */}
        <Surface elevation="floating" borderRadius="2xl" bordered style={[styles.profileCard, { borderColor: colors.primary }]}>
          {/* Decorative glowing sphere inside */}
          <View style={[styles.glowingOrbs, { backgroundColor: colors.primary }]} />
          
          <View style={styles.cardHeader}>
            <UserAvatar uri={user?.avatar} username={user?.username} size="lg" borderRankColor={colors.primary} />
            <View style={styles.rankBadge}>
              <Text variant="micro" weight="bold" color={colors.primary} style={{ letterSpacing: 1 }}>
                {user?.title?.toUpperCase() || 'ROOKIE'}
              </Text>
            </View>
          </View>

          <Spacer size="md" />

          <Text variant="h1" weight="display" color={colors.text}>
            @{user?.username || 'user'}
          </Text>
          <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 2 }}>
            Dayzo Habit Agent • Level {user?.level || 1}
          </Text>

          <Spacer size="xl" />

          {/* User analytics statistics */}
          <View style={[styles.statsDivider, { backgroundColor: colors.borderSubtle }]} />
          <Spacer size="md" />
          
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.text}>{user?.xp || 0}</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>TOTAL XP</Text>
            </View>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.text}>{user?.streak || 0}🔥</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>STREAK</Text>
            </View>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.text}>{user?.longestStreak || 0}👑</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>LONGEST</Text>
            </View>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.text}>{user?.streakFreezes || 0}</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>FREEZES</Text>
            </View>
          </View>
        </Surface>

        <Spacer size="lg" />

        {/* Badge cabinet */}
        <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
          ACHIEVEMENTS CABINET
        </Text>

        <Surface elevation="raised" borderRadius="2xl" bordered style={styles.cabinetCard}>
          {user?.badges && user.badges.length > 0 ? (
            <View style={styles.badgeRow}>
              {user.badges.map((badge: any) => {
                return (
                  <View key={badge.id} style={[styles.badgeItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                    <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
                    <Spacer size="xs" />
                    <Text variant="micro" weight="bold" color={colors.text} align="center" numberOfLines={1}>
                      {badge.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCabinet}>
              <Award size={36} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 8 }} />
              <Text variant="bodySmall" weight="bold" color={colors.textSecondary} align="center">
                Cabinet is currently empty.
              </Text>
              <Text variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: 2 }}>
                Complete daily habits to unlock medals and badges!
              </Text>
            </View>
          )}
        </Surface>

        <Spacer size="lg" />

        {/* Session Utilities */}
        <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
          UTILITIES
        </Text>

        <Surface elevation="raised" borderRadius="xl" bordered style={styles.utilitiesCard}>
          <Pressable onPress={handleLogout} style={styles.utilityBtn}>
            <LogOut size={18} color={colors.error} style={{ marginRight: 12 }} />
            <Text variant="bodySmall" weight="bold" color={colors.error}>
              Logout Active Session
            </Text>
          </Pressable>
        </Surface>

        <Spacer size="5xl" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileCard: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  glowingOrbs: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.08,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 75, 43, 0.1)',
  },
  statsDivider: {
    width: '100%',
    height: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 6,
    letterSpacing: 1,
  },
  cabinetCard: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '22%',
    aspectRatio: 0.8,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  emptyCabinet: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilitiesCard: {
    overflow: 'hidden',
  },
  utilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
