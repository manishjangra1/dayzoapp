import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Award, Crown, ArrowUp, ArrowDown, Minus } from 'lucide-react-native';
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

  // Staggered rank row component
  const StaggeredRankRow = ({ item, rank, index }: { item: any; rank: number; index: number }) => {
    const fadeVal = useSharedValue(0);
    const slideVal = useSharedValue(16);

    useEffect(() => {
      fadeVal.value = withDelay(index * 40, withTiming(1, { duration: 350 }));
      slideVal.value = withDelay(index * 40, withSpring(0, { damping: 12, stiffness: 100 }));
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeVal.value,
        transform: [{ translateY: slideVal.value }],
      };
    });

    // Mock deterministic rank movement
    const shiftHash = (item.username.charCodeAt(0) + item.username.length) % 3;
    const movement = shiftHash === 0 ? 'up' : shiftHash === 1 ? 'down' : 'stable';

    return (
      <Animated.View style={animatedStyle}>
        <View style={[styles.rankRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
          <View style={styles.rankRowLeft}>
            <View style={styles.rankBadgeCell}>
              <Text variant="bodySmall" weight="bold" color={colors.textTertiary} style={styles.rankNum}>
                {rank}
              </Text>
              
              {/* Dynamic shift indicator */}
              {movement === 'up' ? (
                <ArrowUp size={10} color="#34D399" />
              ) : movement === 'down' ? (
                <ArrowDown size={10} color="#F87171" />
              ) : (
                <Minus size={10} color={colors.textTertiary} />
              )}
            </View>

            <UserAvatar uri={item.avatar} username={item.username} size="sm" />
            
            <View style={styles.rankInfo}>
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                @{item.username}
              </Text>
              <Text variant="micro" color={colors.textTertiary}>
                Level {item.level || 1} • {item.title || 'Rookie'}
              </Text>
            </View>
          </View>

          <View style={styles.rankRowRight}>
            <Text variant="bodySmall" weight="bold" color={colors.text}>
              {item.xp} <Text variant="micro" color={colors.textTertiary}>XP</Text>
            </Text>
            <View style={styles.streakPillRow}>
              <Text variant="micro" weight="bold" color={colors.primary}>
                {item.streak || 0}🔥
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Dynamic Backing Mesh Gradients */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDark ? ['#08080C', '#0E0E12'] : ['#F4F5F7', '#EBEFF3']}
          style={StyleSheet.absoluteFill}
        />
        {isDark && (
          <>
            <LinearGradient
              colors={['rgba(255, 75, 43, 0.08)', 'transparent']}
              style={[styles.ambientOrb, { top: -60, left: -60, width: 280, height: 280 }]}
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
        <Text variant="h2" weight="bold" color={colors.text}>
          Arena
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          Streak metrics & ranking.
        </Text>
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
        <GlassCard borderRadius="full" style={styles.scopeSwitcher}>
          <Pressable
            onPress={() => setScope('global')}
            style={[styles.scopeBtn, scope === 'global' && { backgroundColor: colors.primary, borderRadius: radius.full }]}
          >
            <Text variant="micro" weight="bold" color={scope === 'global' ? colors.surface : colors.textSecondary}>
              GLOBAL ARENA
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setScope('friends')}
            style={[styles.scopeBtn, scope === 'friends' && { backgroundColor: colors.primary, borderRadius: radius.full }]}
          >
            <Text variant="micro" weight="bold" color={scope === 'friends' ? colors.surface : colors.textSecondary}>
              MY COMPANIONS
            </Text>
          </Pressable>
        </GlassCard>

        <Spacer size="lg" />

        {/* 3D Golden/Holographic Podium Spotlights */}
        {top3.length > 0 ? (
          <View style={styles.podiumContainer}>
            
            {/* Rank 2 Podium (Silver Glow) */}
            {top3[1] && (
              <View style={styles.podiumCol}>
                <UserAvatar uri={top3[1].avatar} username={top3[1].username} size="md" borderRankColor="rgba(255,255,255,0.4)" />
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.text} numberOfLines={1} style={styles.podiumName}>
                  @{top3[1].username}
                </Text>
                <Text variant="micro" weight="bold" color={colors.primary}>
                  {top3[1].xp} XP
                </Text>
                <GlassCard borderRadius="lg" style={[styles.podiumPillar, { height: 75, borderColor: 'rgba(255,255,255,0.25)' }]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.06)', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                  <Text variant="h1" weight="display" color={colors.textSecondary}>
                    2
                  </Text>
                </GlassCard>
              </View>
            )}

            {/* Rank 1 Podium (Holographic Golden Glow + Crown) */}
            {top3[0] && (
              <View style={[styles.podiumCol, styles.centerPillarWrapper]}>
                <Crown size={22} color="#FFD700" fill="#FFD700" style={styles.crownIcon} />
                <UserAvatar uri={top3[0].avatar} username={top3[0].username} size="lg" borderRankColor="#FFD700" />
                <Spacer size="xs" />
                <Text variant="bodySmall" weight="bold" color={colors.text} numberOfLines={1} style={styles.podiumName}>
                  @{top3[0].username}
                </Text>
                <Text variant="caption" weight="bold" color={colors.primary}>
                  {top3[0].xp} XP
                </Text>
                <GlassCard borderRadius="lg" style={[styles.podiumPillar, { height: 110, borderColor: '#FFD700' }]}>
                  <LinearGradient
                    colors={['rgba(255,215,0,0.15)', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                  <Text variant="hero" weight="display" color="#FFD700" style={{ textShadowColor: 'rgba(255,215,0,0.4)', textShadowRadius: 8 }}>
                    1
                  </Text>
                </GlassCard>
              </View>
            )}

            {/* Rank 3 Podium (Bronze Glow) */}
            {top3[2] && (
              <View style={styles.podiumCol}>
                <UserAvatar uri={top3[2].avatar} username={top3[2].username} size="md" borderRankColor="rgba(242,113,33,0.3)" />
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.text} numberOfLines={1} style={styles.podiumName}>
                  @{top3[2].username}
                </Text>
                <Text variant="micro" weight="bold" color={colors.primary}>
                  {top3[2].xp} XP
                </Text>
                <GlassCard borderRadius="lg" style={[styles.podiumPillar, { height: 60, borderColor: 'rgba(242,113,33,0.2)' }]}>
                  <LinearGradient
                    colors={['rgba(242,113,33,0.06)', 'transparent']}
                    style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                  />
                  <Text variant="h2" weight="display" color={colors.textTertiary}>
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

        {/* Lower rank levels grid */}
        <GlassCard borderRadius="2xl" style={[styles.ranksCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
          {remainder.length === 0 && top3.length === 0 ? (
            <View style={styles.emptyRanks}>
              <Award size={24} color={colors.textTertiary} />
              <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 6 }}>
                Compete daily to register rankings!
              </Text>
            </View>
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
        </GlassCard>
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
  scopeSwitcher: {
    flexDirection: 'row',
    padding: 4,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
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
    transform: [{ scale: 1.05 }],
  },
  trophyIcon: {
    marginBottom: 4,
  },
  podiumPillar: {
    width: '90%',
    borderTopWidth: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyPodium: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ranksCard: {
    overflow: 'hidden',
  },
  emptyRanks: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rankRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNum: {
    width: 24,
    textAlign: 'center',
  },
  rankInfo: {
    justifyContent: 'center',
  },
  rankRowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  rankBadgeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 32,
    justifyContent: 'center',
  },
  streakPillRow: {
    marginTop: 2,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  crownIcon: {
    marginBottom: -2,
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
