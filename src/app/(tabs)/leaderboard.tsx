import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Award, Crown, ArrowUp, ArrowDown, Minus, Sparkles, Zap, Flame } from 'lucide-react-native';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Surface } from '../../design-system/primitives/Surface';
import { Spacer } from '../../design-system/primitives/Spacer';
import { LinearGradient } from 'expo-linear-gradient';
import { UserAvatar } from '../../components/common/UserAvatar';
import { radius } from '../../design-system/tokens/radius';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface StaggeredRankRowProps {
  item: any;
  rank: number;
  index: number;
}

const StaggeredRankRow: React.FC<StaggeredRankRowProps> = React.memo(({ item, rank, index }) => {
  const { colors, isDark } = useTheme();
  // Mock deterministic rank movement
  const shiftHash = (item.username.charCodeAt(0) + item.username.length) % 3;
  const movement = shiftHash === 0 ? 'up' : shiftHash === 1 ? 'down' : 'stable';

  return (
    <GlassCard
      borderRadius="xl"
      intensity="low"
      style={[
        styles.rankRowCard,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          backgroundColor: isDark ? 'rgba(20, 20, 26, 0.4)' : 'rgba(255,255,255,0.7)',
        }
      ]}
    >
      <View style={styles.rankRowLeft}>
        <View style={styles.rankBadgeCell}>
          <Text variant="bodySmall" weight="bold" color={colors.textSecondary} style={styles.rankNum}>
            {rank}
          </Text>
          
          {/* Dynamic shift indicator */}
          {movement === 'up' ? (
            <ArrowUp size={10} color="#10B981" />
          ) : movement === 'down' ? (
            <ArrowDown size={10} color="#EF4444" />
          ) : (
            <Minus size={10} color={colors.textTertiary} />
          )}
        </View>

        <UserAvatar uri={item.avatar} username={item.username} size="sm" borderRankColor="rgba(255,255,255,0.15)" />
        
        <View style={styles.rankInfo}>
          <Text variant="bodySmall" weight="bold" color={colors.text}>
            @{item.username}
          </Text>
          <Text variant="micro" color={colors.textSecondary} style={{ opacity: 0.7 }}>
            Level {item.level || 1} • {item.title || 'Rookie'}
          </Text>
        </View>
      </View>

      <View style={styles.rankRowRight}>
        <View style={[styles.statBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
          <Zap size={11} color={colors.primary} fill={colors.primary} />
          <Text variant="micro" weight="bold" color={colors.text}>
            {item.xp} XP
          </Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: 'rgba(255, 75, 43, 0.08)' }]}>
          <Flame size={11} color="#FF4B2B" fill="#FF4B2B" />
          <Text variant="micro" weight="bold" color="#FF4B2B">
            {item.streak || 0}D
          </Text>
        </View>
      </View>
    </GlassCard>
  );
});

export default function LeaderboardScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<any[]>([]);
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboards = async () => {
    try {
      const resGlobal = await api.get('/leaderboard/global');
      setGlobalLeaderboard(resGlobal.data);

      try {
        const resFriends = await api.get('/leaderboard/friends');
        setFriendsLeaderboard(resFriends.data);
      } catch (e) {
        setFriendsLeaderboard([]);
      }
    } catch (e) {
      console.warn('Failed to load leaderboards:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboards();
  };

  const list = scope === 'global' ? globalLeaderboard : friendsLeaderboard;
  const top3 = list.slice(0, 3);
  const remainder = list.slice(3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Dynamic Ambient Mesh Backplates */}
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
            <LinearGradient
              colors={['rgba(0, 242, 254, 0.04)', 'transparent']}
              style={[styles.ambientOrb, { top: '35%', right: -40, width: 260, height: 260 }]}
            />
          </>
        )}
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        <View style={styles.headerLeftCol}>
          <Text variant="h1" weight="display" color={colors.text}>
            Arena
          </Text>
          <Text variant="micro" weight="bold" color={colors.textSecondary} style={{ letterSpacing: 1.2 }}>
            STREAK METRICS & RANKINGS
          </Text>
        </View>
        <Trophy size={20} color={colors.primary} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Spacer size="md" />

        {/* Unified Glass Scope Switcher */}
        <GlassCard borderRadius="full" intensity="high" style={[styles.scopeSwitcher, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
          <Pressable
            onPress={() => setScope('global')}
            style={[styles.scopeBtn, scope === 'global' && { backgroundColor: colors.primary, borderRadius: radius.full }]}
          >
            <Text variant="micro" weight="bold" color={scope === 'global' ? '#FFFFFF' : colors.textSecondary}>
              GLOBAL ARENA
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setScope('friends')}
            style={[styles.scopeBtn, scope === 'friends' && { backgroundColor: colors.primary, borderRadius: radius.full }]}
          >
            <Text variant="micro" weight="bold" color={scope === 'friends' ? '#FFFFFF' : colors.textSecondary}>
              MY COMPANIONS
            </Text>
          </Pressable>
        </GlassCard>

        <Spacer size="lg" />

        {/* 3D Holographic Podium Spotlights */}
        {top3.length > 0 ? (
          <View style={styles.podiumContainer}>
            
            {/* Rank 2 Podium (Silver Glow / Empty Spot) */}
            {top3[1] ? (
              <View style={styles.podiumCol}>
                <View style={styles.avatarGlowHalo}>
                  <UserAvatar uri={top3[1].avatar} username={top3[1].username} size="md" borderRankColor="rgba(255,255,255,0.6)" />
                </View>
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.text} numberOfLines={1} style={styles.podiumName}>
                  @{top3[1].username}
                </Text>
                <Text variant="micro" weight="bold" color={colors.primary}>
                  {top3[1].xp} XP
                </Text>
                <GlassCard
                  borderRadius="lg"
                  intensity="high"
                  style={[
                    styles.podiumPillar,
                    {
                      height: 85,
                      borderColor: 'rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                  <Text variant="h1" weight="display" color="rgba(255,255,255,0.8)" style={styles.podiumNumber}>
                    2
                  </Text>
                </GlassCard>
              </View>
            ) : (
              <View style={styles.podiumCol}>
                <View style={[styles.avatarGlowHalo, styles.emptyAvatarHalo]}>
                  <View style={[styles.emptyAvatarCircle, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                    <Text variant="micro" weight="bold" color={colors.textTertiary}>?</Text>
                  </View>
                </View>
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.textTertiary} numberOfLines={1} style={styles.podiumName}>
                  Claim Spot
                </Text>
                <Text variant="micro" weight="bold" color={colors.textTertiary}>
                  Secured XP
                </Text>
                <GlassCard
                  borderRadius="lg"
                  intensity="low"
                  style={[
                    styles.podiumPillar,
                    {
                      height: 85,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      borderStyle: 'dashed',
                    }
                  ]}
                >
                  <Text variant="h1" weight="display" color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} style={styles.podiumNumber}>
                    2
                  </Text>
                </GlassCard>
              </View>
            )}

            {/* Rank 1 Podium (Golden Holographic Glow + Crown) */}
            {top3[0] && (
              <View style={[styles.podiumCol, styles.centerPillarWrapper]}>
                <Crown size={24} color={isDark ? '#FFD700' : '#C59B27'} fill={isDark ? '#FFD700' : '#C59B27'} style={styles.crownIcon} />
                <View style={styles.avatarGlowHalo}>
                  <UserAvatar uri={top3[0].avatar} username={top3[0].username} size="lg" borderRankColor={isDark ? '#FFD700' : '#C59B27'} />
                </View>
                <Spacer size="xs" />
                <Text variant="bodySmall" weight="bold" color={colors.text} numberOfLines={1} style={styles.podiumName}>
                  @{top3[0].username}
                </Text>
                <Text variant="caption" weight="bold" color={isDark ? '#FFD700' : '#C59B27'}>
                  {top3[0].xp} XP
                </Text>
                <GlassCard
                  borderRadius="lg"
                  intensity="high"
                  style={[
                    styles.podiumPillar,
                    {
                      height: 120,
                      borderColor: isDark ? '#FFD700' : '#D4AF37',
                      backgroundColor: isDark ? 'rgba(255, 215, 0, 0.05)' : 'rgba(212, 175, 55, 0.06)',
                    }
                  ]}
                >
                  <LinearGradient
                    colors={[isDark ? 'rgba(255,215,0,0.2)' : 'rgba(212,175,55,0.15)', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                  <Text variant="hero" weight="display" color={isDark ? '#FFD700' : '#D4AF37'} style={{ textShadowColor: isDark ? 'rgba(255,215,0,0.5)' : 'rgba(212,175,55,0.3)', textShadowRadius: 10 }}>
                    1
                  </Text>
                </GlassCard>
              </View>
            )}

            {/* Rank 3 Podium (Bronze Glow / Empty Spot) */}
            {top3[2] ? (
              <View style={styles.podiumCol}>
                <View style={styles.avatarGlowHalo}>
                  <UserAvatar uri={top3[2].avatar} username={top3[2].username} size="md" borderRankColor="rgba(244,63,94,0.6)" />
                </View>
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.text} numberOfLines={1} style={styles.podiumName}>
                  @{top3[2].username}
                </Text>
                <Text variant="micro" weight="bold" color={colors.primary}>
                  {top3[2].xp} XP
                </Text>
                <GlassCard
                  borderRadius="lg"
                  intensity="high"
                  style={[
                    styles.podiumPillar,
                    {
                      height: 70,
                      borderColor: 'rgba(244,63,94,0.25)',
                      backgroundColor: 'rgba(244, 63, 94, 0.04)',
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(244,63,94,0.15)', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                  <Text variant="h2" weight="display" color="rgba(244,63,94,0.8)" style={styles.podiumNumber}>
                    3
                  </Text>
                </GlassCard>
              </View>
            ) : (
              <View style={styles.podiumCol}>
                <View style={[styles.avatarGlowHalo, styles.emptyAvatarHalo]}>
                  <View style={[styles.emptyAvatarCircle, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                    <Text variant="micro" weight="bold" color={colors.textTertiary}>?</Text>
                  </View>
                </View>
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.textTertiary} numberOfLines={1} style={styles.podiumName}>
                  Claim Spot
                </Text>
                <Text variant="micro" weight="bold" color={colors.textTertiary}>
                  Secured XP
                </Text>
                <GlassCard
                  borderRadius="lg"
                  intensity="low"
                  style={[
                    styles.podiumPillar,
                    {
                      height: 70,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      borderStyle: 'dashed',
                    }
                  ]}
                >
                  <Text variant="h2" weight="display" color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} style={styles.podiumNumber}>
                    3
                  </Text>
                </GlassCard>
              </View>
            )}
          </View>
        ) : (
          <GlassCard borderRadius="2xl" style={styles.emptyPodium}>
            <Trophy size={40} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 12 }} />
            <Text variant="bodySmall" weight="bold" color={colors.textSecondary}>
              Podium ranks loading...
            </Text>
          </GlassCard>
        )}

        <Spacer size="lg" />

        {/* Lower Ranks Grid List */}
        <View style={styles.ranksCardList}>
          {remainder.length === 0 && top3.length === 0 ? (
            <GlassCard borderRadius="2xl" style={styles.emptyRanks}>
              <Award size={24} color={colors.textTertiary} />
              <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 6 }}>
                Compete daily to register rankings!
              </Text>
            </GlassCard>
          ) : (
            remainder.map((item, idx) => (
              <StaggeredRankRow
                key={idx}
                item={item}
                rank={idx + 4}
                index={idx}
              />
            ))
          )}
        </View>

        {remainder.length === 0 && (
          <>
            <Spacer size="md" />
            <GlassCard
              borderRadius="2xl"
              style={[
                styles.inviteCard,
                {
                  borderColor: isDark ? 'rgba(255, 75, 43, 0.2)' : 'rgba(255, 75, 43, 0.1)',
                  backgroundColor: isDark ? 'rgba(20, 20, 26, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 75, 43, 0.04)', 'transparent']}
                style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
              />
              <View style={styles.inviteHeader}>
                <Award size={20} color={colors.primary} />
                <Text variant="bodySmall" weight="bold" color={colors.text} style={{ marginLeft: 6 }}>
                  Assemble Your Crew
                </Text>
              </View>
              <Text variant="caption" color={colors.textSecondary} style={styles.inviteDesc}>
                Streaks are better with companions! Invite your companions to this arena to rank total XP, lock in daily consistency, and compile atomic habits together.
              </Text>
              <Spacer size="sm" />
              <Pressable
                onPress={onRefresh}
                style={({ pressed }) => [
                  styles.inviteBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.9 : 1,
                  }
                ]}
              >
                <Text variant="bodySmall" weight="bold" color="#FFFFFF">
                  INVITE COMPANIONS
                </Text>
              </Pressable>
            </GlassCard>
          </>
        )}

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
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeftCol: {
    gap: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  scopeSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 20,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerPillarWrapper: {
    zIndex: 10,
    transform: [{ scale: 1.06 }],
  },
  avatarGlowHalo: {},
  podiumPillar: {
    width: '90%',
    borderTopWidth: 2,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
  },
  podiumNumber: {
    fontSize: 28,
  },
  emptyPodium: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ranksCardList: {
    gap: 8,
  },
  emptyRanks: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rankRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  rankRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNum: {
    fontSize: 14,
    textAlign: 'center',
  },
  rankInfo: {
    justifyContent: 'center',
  },
  rankRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 4,
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  rankBadgeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 32,
    justifyContent: 'center',
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  crownIcon: {
    marginBottom: 4,
  },
  emptyAvatarHalo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  inviteCard: {
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inviteDesc: {
    lineHeight: 18,
  },
  inviteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
