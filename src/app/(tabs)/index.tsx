import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { useDialog } from '../../design-system/theme/DialogProvider';
import { Text } from '../../design-system/primitives/Text';
import { Surface } from '../../design-system/primitives/Surface';
import { Spacer } from '../../design-system/primitives/Spacer';
import { StreakFlame } from '../../features/home/components/StreakFlame';
import { XPRing } from '../../features/home/components/XPRing';
import { ConsistencyMeter } from '../../features/home/components/ConsistencyMeter';
import { MotivationBanner } from '../../features/home/components/MotivationBanner';
import { ChallengeCard } from '../../features/home/components/ChallengeCard';
import { UserAvatar } from '../../components/common/UserAvatar';
import ShareCard from '../../components/ShareCard';
import { radius } from '../../design-system/tokens/radius';

const generateCurrentWeekDays = (historyData?: any[]) => {
  const today = new Date();
  const dayOfToday = today.getDay();
  const distanceToMonday = dayOfToday === 0 ? -6 : 1 - dayOfToday;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return dayNames.map((dayName, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    
    const completed = historyData
      ? historyData.some((h: any) => {
          if (!h.completed) return false;
          const compDate = new Date(h.createdAt);
          return compDate.toDateString() === dayDate.toDateString();
        })
      : false;

    return {
      dayName,
      completed,
      isToday: dayDate.toDateString() === today.toDateString(),
    };
  });
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, token, isAuthenticated, updateUser } = useAuthStore();

  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [weeklyConsistency, setWeeklyConsistency] = useState<any[]>(() => generateCurrentWeekDays());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHomeData = async () => {
    try {
      // 1. Fetch today's challenge
      const resChallenge = await api.get('/challenges/today');
      setTodayChallenge(resChallenge.data);

      // 2. Fetch fresh user profile details
      const resProfile = await api.get('/users/profile');
      updateUser(resProfile.data);

      // 3. Fetch challenge history to check today's status
      const resHistory = await api.get('/challenges/history');
      const hasCompleted = resHistory.data.some((h: any) => {
        if (!h.completed) return false;
        const compDate = new Date(h.createdAt);
        const today = new Date();
        return compDate.toDateString() === today.toDateString();
      });
      setCompletedToday(hasCompleted);
      setWeeklyConsistency(generateCurrentWeekDays(resHistory.data));
    } catch (e) {
      console.warn('Failed to load home details from API:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHomeData();
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const dialog = useDialog();
  const [shareVisible, setShareVisible] = useState(false);
  const [proofText, setProofText] = useState('');

  const handleCompleteChallenge = async (submittedProof: string) => {
    if (!todayChallenge) return;
    try {
      setActionLoading(true);
      await api.post('/challenges/complete', {
        proofText: submittedProof.trim() || undefined
      });
      setCompletedToday(true);
      setWeeklyConsistency((prev) =>
        prev.map((d) => (d.isToday ? { ...d, completed: true } : d))
      );
      
      // Refresh user details to update XP, streaks, level!
      const resProfile = await api.get('/users/profile');
      updateUser(resProfile.data);

      // Trigger the cinematic share card popup!
      setShareVisible(true);
    } catch (e) {
      console.warn('Failed to complete challenge:', e);
      dialog.show({
        title: 'Error',
        message: 'Failed to record completion. Please try again.',
        primaryAction: { text: 'OK' }
      });
    } finally {
      setActionLoading(false);
      setProofText('');
    }
  };

  const triggerCompleteChallengeWithProof = () => {
    let localProof = '';
    dialog.show({
      title: 'Challenge Verification',
      message: (
        <View style={{ width: '100%', paddingVertical: 8 }}>
          <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: 8 }}>
            Type a quick note of verification (e.g. "Did 20 pushups in my bedroom!")
          </Text>
          <TextInput
            placeholder="Type completion log..."
            placeholderTextColor={colors.textTertiary}
            onChangeText={(txt) => { localProof = txt; }}
            style={{
              width: '100%',
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              borderWidth: 1,
              borderRadius: radius.md,
              color: colors.text,
              padding: 12,
              minHeight: 50,
              fontSize: 14,
            }}
          />
        </View>
      ),
      primaryAction: {
        text: 'VERIFY & COMPLETE',
        variant: 'primary',
        onPress: async () => {
          await handleCompleteChallenge(localProof);
        }
      },
      secondaryAction: {
        text: 'CANCEL',
        variant: 'ghost',
      }
    });
  };

  const getTimeOfDayGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Home Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <UserAvatar uri={user?.avatar} username={user?.username} size="sm" borderRankColor={colors.primary} />
          <View style={styles.greetingText}>
            <Text variant="caption" color={colors.textTertiary}>
              {getTimeOfDayGreeting()}
            </Text>
            <Text variant="body" weight="bold" color={colors.text}>
              {user?.username || 'Ecosystem User'}
            </Text>
          </View>
        </View>
        
        {/* Streak Flame in Header */}
        <StreakFlame streak={user?.streak || 0} size={20} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Spacer size="md" />

        {/* Level and XP Hero widget */}
        <Surface elevation="raised" borderRadius="2xl" bordered style={styles.xpHeroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroRing}>
              <XPRing xp={user?.xp || 0} level={user?.level || 1} size={110} />
            </View>
            <View style={styles.heroStats}>
              <Text variant="h3" weight="bold" color={colors.text}>
                Streak Level Progress
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, lineHeight: 16 }}>
                Each daily complete compounds {user?.level === 1 ? '1.0x' : `${(1 + (user?.level || 1) * 0.1).toFixed(1)}x`} XP multiplier. Collect badges at milestones.
              </Text>
              <Spacer size="sm" />
              <View style={styles.miniStatsRow}>
                <View>
                  <Text variant="caption" color={colors.textTertiary}>Longest Streak</Text>
                  <Text variant="bodySmall" weight="bold" color={colors.text}>{user?.longestStreak || 0} Days</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.borderSubtle }]} />
                <View>
                  <Text variant="caption" color={colors.textTertiary}>Streak Freezes</Text>
                  <Text variant="bodySmall" weight="bold" color={colors.text}>{user?.streakFreezes || 0}</Text>
                </View>
              </View>
            </View>
          </View>
        </Surface>

        <Spacer size="md" />

        {/* Motivation quote banner */}
        <MotivationBanner />

        <Spacer size="md" />

        {/* Today's Challenge Section */}
        <View style={styles.sectionHeader}>
          <Text variant="h3" weight="bold" color={colors.text}>
            Today's Commit
          </Text>
          <Text variant="caption" color={colors.textTertiary}>
            Rotates every 24 hours
          </Text>
        </View>

        {todayChallenge ? (
          <ChallengeCard
            challenge={todayChallenge}
            completed={completedToday}
            onComplete={triggerCompleteChallengeWithProof}
            actionLoading={actionLoading}
            onShare={() => setShareVisible(true)}
          />
        ) : (
          <Surface elevation="raised" borderRadius="xl" bordered style={styles.emptyCard}>
            <Text variant="bodySmall" color={colors.textSecondary} align="center">
              All caught up! Next rotating daily challenge becomes available at midnight.
            </Text>
          </Surface>
        )}

        <Spacer size="md" />

        {/* Consistency Grid */}
        <ConsistencyMeter days={weeklyConsistency} />

        <Spacer size="5xl" />
      </ScrollView>

      <ShareCard
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        username={user?.username || 'user'}
        streak={user?.streak || 0}
        xp={todayChallenge?.xpReward || 15}
        levelTitle={user?.title || 'Rookie'}
        challengeTitle={todayChallenge?.title || 'Daily Commit'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingText: {
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for floating tab bar
  },
  xpHeroCard: {
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  heroRing: {
    width: 110,
    height: 138,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  heroStats: {
    flex: 1,
    justifyContent: 'center',
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
