import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Platform, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { useDialog } from '../../design-system/theme/DialogProvider';
import { Text } from '../../design-system/primitives/Text';
import { Surface } from '../../design-system/primitives/Surface';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Spacer } from '../../design-system/primitives/Spacer';
import { StreakFlame } from '../../features/home/components/StreakFlame';
import { XPRing } from '../../features/home/components/XPRing';
import { ConsistencyMeter } from '../../features/home/components/ConsistencyMeter';
import { MotivationBanner } from '../../features/home/components/MotivationBanner';
import { ChallengeCard } from '../../features/home/components/ChallengeCard';
import { UserAvatar } from '../../components/common/UserAvatar';
import ShareCard from '../../components/ShareCard';
import { radius } from '../../design-system/tokens/radius';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Zap, Flame, Compass } from 'lucide-react-native';

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
  const { colors, isDark } = useTheme();
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
      const resChallenge = await api.get('/challenges/today');
      setTodayChallenge(resChallenge.data);

      const resProfile = await api.get('/users/profile');
      updateUser(resProfile.data);

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
      
      const resProfile = await api.get('/users/profile');
      updateUser(resProfile.data);

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

  // Calculate consistency momentum rating
  const completedCount = weeklyConsistency.filter((d) => d.completed).length;
  const momentumScore = Math.min(100, Math.max(15, Math.round((completedCount / weeklyConsistency.length) * 100) + (user?.streak || 0) * 3));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Cinematic Ambient Background Mesh Orbs */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDark ? ['#08080C', '#0E0E12'] : ['#F4F5F7', '#EBEFF3']}
          style={StyleSheet.absoluteFill}
        />
        {isDark && (
          <>
            <LinearGradient
              colors={['rgba(255, 75, 43, 0.08)', 'transparent']}
              style={[styles.ambientOrb, { top: -80, left: -60, width: 280, height: 280 }]}
            />
            <LinearGradient
              colors={['rgba(138, 35, 135, 0.06)', 'transparent']}
              style={[styles.ambientOrb, { bottom: 120, right: -80, width: 340, height: 340 }]}
            />
          </>
        )}
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Spacer size="md" />

        {/* Master XP Progression Hub Card */}
        <GlassCard borderRadius="2xl" intensity="high" style={[styles.xpHeroCard, { borderColor: 'rgba(255,255,255,0.06)' }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroRing}>
              <XPRing xp={user?.xp || 0} level={user?.level || 1} size={114} />
            </View>
            <View style={styles.heroStats}>
              <View style={styles.questTitleRow}>
                <Sparkles size={14} color={colors.primary} />
                <Text variant="h3" weight="bold" color={colors.text}>
                  Habit Hub Level
                </Text>
              </View>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, lineHeight: 15 }}>
                Securing quests increases your streak level and unlocks new capabilities.
              </Text>
              
              <Spacer size="sm" />

              {/* Dynamic Momentum Score Widget */}
              <View style={styles.momentumContainer}>
                <View style={styles.momentumLabels}>
                  <Text variant="micro" weight="bold" color={colors.textTertiary}>MOMENTUM RATE</Text>
                  <Text variant="micro" weight="bold" color={colors.primary}>{momentumScore}% MAX</Text>
                </View>
                <View style={[styles.momentumTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                  <View style={[styles.momentumBar, { width: `${momentumScore}%`, backgroundColor: colors.primary }]} />
                </View>
              </View>

              <Spacer size="xs" />

              {/* Daily Energy Indicator */}
              <View style={styles.energyRow}>
                <Zap size={12} color="#00F2FE" fill="#00F2FE" />
                <Text variant="micro" weight="bold" color={colors.textSecondary}>
                  DAILY FUEL: {completedToday ? '5/5 UNITS FULL' : '3/5 UNITS ACTIVE'}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <Spacer size="md" />

        {/* Motivation quote banner */}
        <MotivationBanner />

        <Spacer size="md" />

        {/* Today's Challenge Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleCol}>
            <Text variant="h2" weight="display" color={colors.text}>
              Today's Challenge
            </Text>
            <Text variant="micro" weight="bold" color={colors.textSecondary} style={{ letterSpacing: 0.5 }}>
              ROTATES EVERY 24 HOURS
            </Text>
          </View>
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
          <GlassCard borderRadius="2xl" style={styles.emptyCard}>
            <Compass size={32} color={colors.textTertiary} style={{ opacity: 0.4, marginBottom: 8 }} />
            <Text variant="bodySmall" color={colors.textSecondary} align="center">
              All caught up! Next rotating daily challenge becomes available at midnight.
            </Text>
          </GlassCard>
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
  ambientOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10,
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
    zIndex: 5,
  },
  xpHeroCard: {
    padding: 16,
    borderWidth: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  heroRing: {
    width: 114,
    height: 142,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  heroStats: {
    flex: 1,
    justifyContent: 'center',
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  momentumContainer: {
    width: '100%',
  },
  momentumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  momentumTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  momentumBar: {
    height: '100%',
    borderRadius: 3,
  },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitleCol: {
    gap: 2,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
