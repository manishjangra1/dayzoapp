import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Clipboard, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { Award, Users, Zap, Copy, Target } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { useDialog } from '../../design-system/theme/DialogProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Spacer } from '../../design-system/primitives/Spacer';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { UserAvatar } from '../../components/common/UserAvatar';
import { radius } from '../../design-system/tokens/radius';
import { StreakFlame } from '../../features/home/components/StreakFlame';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface SquadMember {
  id: string;
  username: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
}

interface Squad {
  id: string;
  name: string;
  avatar: string;
  inviteCode: string;
  xp: number;
  members: SquadMember[];
}

export default function SquadsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const dialog = useDialog();

  const [mySquad, setMySquad] = useState<Squad | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [joinCode, setJoinCode] = useState('');
  const [squadName, setSquadName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const fetchSquadDetails = async () => {
    try {
      const resMySquad = await api.get('/squads/my-squad');
      setMySquad(resMySquad.data);

      const resLeaderboard = await api.get('/squads/leaderboard');
      setLeaderboard(resLeaderboard.data);
    } catch (e) {
      console.warn('Failed to load squad statistics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSquadDetails();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSquadDetails();
  };

  const handleCreateSquad = async () => {
    if (!squadName.trim()) {
      dialog.show({
        title: 'Required Name',
        message: 'Please enter a name for your new squad.',
        primaryAction: { text: 'OK' }
      });
      return;
    }

    try {
      setCreateLoading(true);
      const res = await api.post('/squads/create', { name: squadName.trim() });
      dialog.show({
        title: 'Success',
        message: `Squad "${res.data.name}" has been created! Share your invite code to invite teammates.`,
        primaryAction: { text: 'OK' }
      });
      setMySquad(res.data);
      setSquadName('');
      fetchSquadDetails();
    } catch (e: any) {
      dialog.show({
        title: 'Failed to Create',
        message: e.response?.data?.message || 'Failed to create squad.',
        primaryAction: { text: 'OK', variant: 'primary' }
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinSquad = async () => {
    if (!joinCode.trim() || joinCode.trim().length < 4) {
      dialog.show({
        title: 'Invalid Code',
        message: 'Please enter a valid squad invite code.',
        primaryAction: { text: 'OK' }
      });
      return;
    }

    try {
      setJoinLoading(true);
      const res = await api.post('/squads/join', { inviteCode: joinCode.trim().toUpperCase() });
      dialog.show({
        title: 'Success',
        message: `Successfully joined squad: "${res.data.name}"!`,
        primaryAction: { text: 'OK' }
      });
      setMySquad(res.data);
      setJoinCode('');
      fetchSquadDetails();
    } catch (e: any) {
      dialog.show({
        title: 'Failed to Join',
        message: e.response?.data?.message || 'Invalid invite code or squad is full.',
        primaryAction: { text: 'OK', variant: 'primary' }
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!mySquad) return;

    dialog.show({
      title: 'Leave Squad',
      message: `Are you sure you want to leave "${mySquad.name}"?`,
      primaryAction: {
        text: 'LEAVE',
        variant: 'danger',
        onPress: async () => {
          try {
            setLeaveLoading(true);
            await api.post('/squads/leave');
            dialog.show({
              title: 'Success',
              message: 'You have left the squad.',
              primaryAction: { text: 'OK' }
            });
            setMySquad(null);
            fetchSquadDetails();
          } catch (e: any) {
            dialog.show({
              title: 'Error',
              message: e.response?.data?.message || 'Failed to leave squad.',
              primaryAction: { text: 'OK', variant: 'primary' }
            });
          } finally {
            setLeaveLoading(false);
          }
        },
      },
      secondaryAction: {
        text: 'CANCEL',
        variant: 'ghost',
      },
    });
  };

  const copyToClipboard = () => {
    if (mySquad?.inviteCode) {
      Clipboard.setString(mySquad.inviteCode);
      dialog.show({
        title: 'Copied',
        message: 'Invite code copied to clipboard!',
        primaryAction: { text: 'OK' }
      });
    }
  };

  // Staggered member row component
  const StaggeredMemberRow = ({ member, index, total }: { member: SquadMember; index: number; total: number }) => {
    const fadeVal = useSharedValue(0);
    const slideVal = useSharedValue(12);

    useEffect(() => {
      fadeVal.value = withDelay(index * 60, withTiming(1, { duration: 300 }));
      slideVal.value = withDelay(index * 60, withSpring(0, { damping: 12, stiffness: 120 }));
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeVal.value,
        transform: [{ translateY: slideVal.value }],
      };
    });

    // Deterministic mock daily complete status
    const completedToday = member.xp % 3 === 0 || member.streak > 0;

    return (
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.memberRow,
            index < total - 1 && { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          ]}
        >
          <View style={styles.memberLeft}>
            <UserAvatar
              uri={member.avatar}
              username={member.username}
              size="sm"
              borderRankColor={completedToday ? '#34D399' : undefined}
            />
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text variant="bodySmall" weight="bold" color={colors.text}>
                  @{member.username}
                </Text>
                {completedToday && (
                  <View style={styles.completeStatusDot} />
                )}
              </View>
              <Text variant="micro" color={colors.textTertiary}>
                Level {member.level}
              </Text>
            </View>
          </View>

          <View style={styles.memberRight}>
            <Text variant="bodySmall" weight="bold" color={colors.text}>
              {member.xp} <Text variant="micro" color={colors.textTertiary}>XP</Text>
            </Text>
            {member.streak > 0 && <StreakFlame streak={member.streak} size={14} showText={true} />}
          </View>
        </View>
      </Animated.View>
    );
  };

  // Staggered leaderboard row component
  const StaggeredLeaderboardRow = ({ squad, index, total }: { squad: any; index: number; total: number }) => {
    const fadeVal = useSharedValue(0);
    const slideVal = useSharedValue(12);

    useEffect(() => {
      fadeVal.value = withDelay(index * 60, withTiming(1, { duration: 300 }));
      slideVal.value = withDelay(index * 60, withSpring(0, { damping: 12, stiffness: 120 }));
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: fadeVal.value,
        transform: [{ translateY: slideVal.value }],
      };
    });

    const isTopThree = index < 3;
    const rankColors = ['#FBBF24', '#9CA3AF', '#CD7F32']; // Gold, Silver, Bronze

    return (
      <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.leaderboardRow,
            index < total - 1 && { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          ]}
        >
          <View style={styles.leaderboardRowLeft}>
            <Text
              variant="bodySmall"
              weight="bold"
              color={isTopThree ? rankColors[index] : colors.textTertiary}
              style={styles.rankNum}
            >
              {index + 1}
            </Text>
            <UserAvatar uri={squad.avatar} username={squad.name} size="sm" borderRankColor={isTopThree ? rankColors[index] : colors.accent} />
            <View style={styles.rankInfo}>
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                {squad.name}
              </Text>
              <Text variant="micro" color={colors.textTertiary}>
                Alliance
              </Text>
            </View>
          </View>

          <View style={styles.leaderboardRowRight}>
            <Text variant="bodySmall" weight="bold" color={colors.text}>
              {squad.xp} <Text variant="micro" color={colors.textTertiary}>XP</Text>
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Background ambient linear mesh */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDark ? ['#08080C', '#0E0E12'] : ['#F4F5F7', '#EBEFF3']}
          style={StyleSheet.absoluteFill}
        />
        {isDark && (
          <>
            <LinearGradient
              colors={['rgba(138, 35, 135, 0.05)', 'transparent']}
              style={[styles.ambientOrb, { top: -60, right: -60, width: 280, height: 280 }]}
            />
            <LinearGradient
              colors={['rgba(0, 242, 254, 0.05)', 'transparent']}
              style={[styles.ambientOrb, { bottom: 120, left: -80, width: 340, height: 340 }]}
            />
          </>
        )}
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        <Text variant="h2" weight="bold" color={colors.text}>
          Squads
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          Collaborative habit networks.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Spacer size="sm" />
          <Text variant="caption" color={colors.textTertiary}>Loading squad alliances...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <Spacer size="md" />

          {mySquad ? (
            <View>
              {/* Squad Header Glass Card */}
              <GlassCard borderRadius="2xl" intensity="high" style={[styles.squadHeroCard, { borderColor: 'rgba(255,255,255,0.06)' }]}>
                <LinearGradient
                  colors={['rgba(0, 242, 254, 0.04)', 'transparent']}
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
                />
                
                <View style={styles.heroRow}>
                  <UserAvatar uri={mySquad.avatar} username={mySquad.name} size="lg" borderRankColor={colors.accent} />
                  <View style={styles.heroDetails}>
                    <Text variant="h2" weight="bold" color={colors.text}>
                      {mySquad.name}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      Invite Code: <Text variant="caption" weight="bold" color={colors.primary}>{mySquad.inviteCode}</Text>
                    </Text>
                    <Spacer size="xs" />
                    <View style={styles.pillRow}>
                      <Pressable onPress={copyToClipboard} style={[styles.actionPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.borderSubtle }]}>
                        <Copy size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text variant="micro" weight="bold" color={colors.textSecondary}>Copy Code</Text>
                      </Pressable>
                      <View style={[styles.memberCountPill, { backgroundColor: 'rgba(255, 75, 43, 0.12)' }]}>
                        <Users size={11} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text variant="micro" weight="bold" color={colors.primary}>{mySquad.members.length}/5 Members</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Spacer size="lg" />
                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]} />
                <Spacer size="md" />

                <View style={styles.xpRow}>
                  <View>
                    <Text variant="micro" color={colors.textTertiary}>TOTAL ALLIANCE XP</Text>
                    <Text variant="h2" weight="bold" color={colors.text}>{mySquad.xp} XP</Text>
                  </View>
                  <View style={[styles.multiplierPill, { backgroundColor: colors.accent + '20' }]}>
                    <Zap size={14} color={colors.accent} fill={colors.accent} style={{ marginRight: 4 }} />
                    <Text variant="caption" weight="bold" color={colors.accent}>
                      {1 + mySquad.members.length * 0.1}x Boost
                    </Text>
                  </View>
                </View>
              </GlassCard>

              <Spacer size="lg" />

              {/* Weekly Alliance Mission Progress Hub */}
              <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
                ACTIVE WEEKLY QUEST
              </Text>
              
              <GlassCard borderRadius="2xl" style={[styles.allianceQuestCard, { borderColor: 'rgba(255,255,255,0.06)' }]}>
                <View style={styles.questHeader}>
                  <Target size={16} color={colors.accent} />
                  <Text variant="bodySmall" weight="bold" color={colors.text}>
                    Alliance Conquest Quest
                  </Text>
                </View>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, lineHeight: 16 }}>
                  Secured collectively: Compete to compile 350 XP as a team this week!
                </Text>
                <Spacer size="md" />
                
                {/* Alliance Quest Progress slider */}
                <View style={styles.missionProgressRow}>
                  <View style={styles.labelsRow}>
                    <Text variant="micro" weight="bold" color={colors.textTertiary}>CURRENT ACCUMULATED</Text>
                    <Text variant="micro" weight="bold" color={colors.accent}>82% COMPLETE</Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={[styles.progressBarFull, { width: '82%', backgroundColor: colors.accent }]} />
                  </View>
                </View>
              </GlassCard>

              <Spacer size="lg" />

              {/* Teammates List */}
              <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
                SQUAD TEAMMATES
              </Text>

              <GlassCard borderRadius="2xl" style={[styles.membersCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
                {mySquad.members
                  .sort((a, b) => b.xp - a.xp)
                  .map((member, index) => (
                    <StaggeredMemberRow
                      key={member.id}
                      member={member}
                      index={index}
                      total={mySquad.members.length}
                    />
                  ))}
              </GlassCard>

              <Spacer size="xl" />

              <AnimatedButton
                title="Leave Alliance"
                onPress={handleLeaveSquad}
                variant="danger"
                loading={leaveLoading}
                borderRadius="md"
              />
            </View>
          ) : (
            /* Join or create squad layout */
            <View>
              {/* Feature Intro */}
              <GlassCard borderRadius="2xl" style={[styles.lockCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
                <LinearGradient
                  colors={['rgba(255, 75, 43, 0.04)', 'transparent']}
                  style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
                />
                <Users size={38} color={colors.primary} style={{ marginBottom: 12 }} />
                <Text variant="h3" weight="bold" color={colors.text} align="center">
                  Form a Habit Alliance
                </Text>
                <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 6, lineHeight: 18 }}>
                  Create or join a cooperative squad of up to 5 friends. Build concurrent habit chains to boost XP multipliers up to 1.5x and rise on the alliances leaderboard!
                </Text>
              </GlassCard>

              <Spacer size="lg" />

              {/* Action panels */}
              <GlassCard borderRadius="2xl" style={[styles.actionCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
                {/* Join Squad */}
                <Text variant="bodySmall" weight="bold" color={colors.text}>
                  Join Existing Alliance
                </Text>
                <Spacer size="xs" />
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.borderSubtle }]}>
                  <TextInput
                    placeholder="Enter 6-digit invite code (e.g. AX79Q1)"
                    placeholderTextColor={colors.textTertiary}
                    value={joinCode}
                    onChangeText={setJoinCode}
                    autoCapitalize="characters"
                    maxLength={10}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
                <Spacer size="sm" />
                <AnimatedButton
                  title="Join Squad"
                  onPress={handleJoinSquad}
                  loading={joinLoading}
                  borderRadius="md"
                />

                <Spacer size="xl" />
                <View style={[styles.cardDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]} />
                <Spacer size="xl" />

                {/* Create Squad */}
                <Text variant="bodySmall" weight="bold" color={colors.text}>
                  Create New Alliance
                </Text>
                <Spacer size="xs" />
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.borderSubtle }]}>
                  <TextInput
                    placeholder="Alliance Name (e.g. Streak Titans)"
                    placeholderTextColor={colors.textTertiary}
                    value={squadName}
                    onChangeText={setSquadName}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
                <Spacer size="sm" />
                <AnimatedButton
                  title="Create Squad"
                  onPress={handleCreateSquad}
                  loading={createLoading}
                  borderRadius="md"
                />
              </GlassCard>
            </View>
          )}

          <Spacer size="lg" />

          {/* Squad Leaderboards */}
          <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
            TOP ALLIANCES LEADERBOARD
          </Text>

          <GlassCard borderRadius="2xl" style={[styles.leaderboardCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
            {leaderboard.length > 0 ? (
              leaderboard.map((squad, index) => (
                <StaggeredLeaderboardRow
                  key={squad.id}
                  squad={squad}
                  index={index}
                  total={leaderboard.length}
                />
              ))
            ) : (
              <View style={styles.emptyLeaderboard}>
                <Award size={24} color={colors.textTertiary} style={{ opacity: 0.3, marginBottom: 8 }} />
                <Text variant="caption" color={colors.textTertiary} align="center">
                  No habit alliances formed yet. Create yours to claim the top spot!
                </Text>
              </View>
            )}
          </GlassCard>

          <Spacer size="5xl" />
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  lockCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadHeroCard: {
    padding: 20,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroDetails: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  memberCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  divider: {
    width: '100%',
    height: 1,
  },
  cardDivider: {
    width: '100%',
    height: 1,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  multiplierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 6,
    letterSpacing: 1,
    marginTop: 18,
  },
  membersCard: {
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberInfo: {
    justifyContent: 'center',
  },
  memberRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  actionCard: {
    padding: 24,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  leaderboardCard: {
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  leaderboardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNum: {
    width: 20,
    textAlign: 'center',
  },
  rankInfo: {
    justifyContent: 'center',
  },
  leaderboardRowRight: {
    justifyContent: 'center',
  },
  emptyLeaderboard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  allianceQuestCard: {
    padding: 16,
    overflow: 'hidden',
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionProgressRow: {
    marginTop: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: radius.full || 999,
    overflow: 'hidden',
  },
  progressBarFull: {
    height: '100%',
    borderRadius: radius.full || 999,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
});
