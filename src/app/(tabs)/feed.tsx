import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView, RefreshControl, Platform, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Plus, Zap, Heart, MessageSquare, Compass, Search, UserPlus, UserMinus, UserCheck, Send, Smile, X } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { useDialog } from '../../design-system/theme/DialogProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Surface } from '../../design-system/primitives/Surface';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { UserAvatar } from '../../components/common/UserAvatar';
import { radius } from '../../design-system/tokens/radius';

interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
    avatar?: string;
  };
}

interface FeedItem {
  id: string;
  userId: string;
  completedAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
    streak: number;
  };
  challenge: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  reactions: { username: string; emoji: string }[];
  comments?: FeedComment[];
}

export default function SocialFeedScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const dialog = useDialog();

  // Navigation tabs: 'feed' | 'discover'
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');

  // Feed Screen State
  const [socialFeed, setSocialFeed] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Discovery / Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchUsers, setSearchUsers] = useState<any[]>([]);
  const [searchSquads, setSearchSquads] = useState<any[]>([]);
  const [friendInput, setFriendInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Friends Alliance Modal State
  const [friendsListVisible, setFriendsListVisible] = useState(false);
  const [activeFriends, setActiveFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [fetchingFriends, setFetchingFriends] = useState(false);

  const fetchSocialConnections = async () => {
    try {
      setFetchingFriends(true);
      const resFriends = await api.get('/social/friends');
      const resRequests = await api.get('/social/requests');
      setActiveFriends(resFriends.data);
      setPendingRequests(resRequests.data);
    } catch (e) {
      console.warn('Failed to load social connections:', e);
    } finally {
      setFetchingFriends(false);
    }
  };

  const handleAcceptFriend = async (senderId: string, senderName: string) => {
    try {
      await api.post('/social/accept', { senderId });
      dialog.show({
        title: 'Alliance Formed!',
        message: `You are now companions with @${senderName}!`,
        primaryAction: { text: 'HOORAY!' }
      });
      fetchSocialConnections();
      fetchFeed();
    } catch (e) {
      console.warn('Failed to accept request:', e);
    }
  };

  const handleDeclineFriend = async (senderId: string, senderName: string) => {
    try {
      await api.post('/social/decline', { senderId });
      dialog.show({
        title: 'Request Declined',
        message: `Companion request from @${senderName} has been declined.`,
        primaryAction: { text: 'OK' }
      });
      fetchSocialConnections();
    } catch (e) {
      console.warn('Failed to decline request:', e);
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    dialog.show({
      title: 'Sever Habit Alliance?',
      message: `Are you sure you want to unfriend @${friendName}? You will no longer compile habits together in your activity feed.`,
      primaryAction: {
        text: 'UNFRIEND',
        variant: 'danger',
        onPress: async () => {
          try {
            await api.post('/social/remove', { friendId });
            dialog.show({
              title: 'Alliance Severed',
              message: `You are no longer companions with @${friendName}.`,
              primaryAction: { text: 'OK' }
            });
            fetchSocialConnections();
            fetchFeed();
          } catch (e) {
            console.warn('Failed to remove friend:', e);
          }
        }
      },
      secondaryAction: {
        text: 'CANCEL',
        variant: 'ghost'
      }
    });
  };

  const fetchFeed = async () => {
    try {
      const res = await api.get('/social/feed');
      setSocialFeed(res.data);
    } catch (e) {
      console.warn('Failed to load social feed:', e);
    } finally {
      setLoadingFeed(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchSocialConnections();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
    fetchSocialConnections();
  };

  const handleAddFriend = async (targetUsername?: string) => {
    const nameToRequest = targetUsername || friendInput;
    if (!nameToRequest.trim()) return;

    try {
      setActionLoading(true);
      await api.post('/social/request', {
        username: nameToRequest.trim().toLowerCase(),
      });
      dialog.show({
        title: 'Request Sent',
        message: `Companion request sent to @${nameToRequest}!`,
        primaryAction: { text: 'OK' }
      });
      if (!targetUsername) {
        setFriendInput('');
      }
      fetchFeed();
    } catch (e: any) {
      dialog.show({
        title: 'Request Failed',
        message: e.response?.data?.message || 'Failed to send request.',
        primaryAction: { text: 'OK', variant: 'primary' }
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReaction = async (targetUserId: string, emoji: string) => {
    try {
      await api.post('/social/react', {
        targetUserId,
        emoji,
      });
      
      // Optimistic reaction updates
      setSocialFeed(
        socialFeed.map((item) => {
          if (item.user.id === targetUserId) {
            // Filter out existing reactions by current user to avoid duplicates
            const filteredReactions = (item.reactions || []).filter(
              (r) => r.username !== user?.username
            );
            return {
              ...item,
              reactions: [...filteredReactions, { username: user?.username || 'You', emoji }],
            };
          }
          return item;
        })
      );
    } catch (e) {
      console.warn('Failed to send reaction:', e);
    }
  };

  const handlePostComment = async (userChallengeId: string) => {
    const content = commentInputs[userChallengeId];
    if (!content || !content.trim()) return;

    try {
      setSubmittingComment(prev => ({ ...prev, [userChallengeId]: true }));
      const resComment = await api.post('/social/comment', {
        userChallengeId,
        content: content.trim(),
      });

      // Update feed locally
      setSocialFeed(
        socialFeed.map((item) => {
          if (item.id === userChallengeId) {
            return {
              ...item,
              comments: [...(item.comments || []), resComment.data],
            };
          }
          return item;
        })
      );

      // Clear input
      setCommentInputs(prev => ({ ...prev, [userChallengeId]: '' }));
    } catch (e) {
      console.warn('Failed to post comment:', e);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [userChallengeId]: false }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchUsers([]);
      setSearchSquads([]);
      return;
    }

    try {
      setSearching(true);
      const res = await api.get(`/social/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchUsers(res.data.users || []);
      setSearchSquads(res.data.squads || []);
    } catch (e) {
      console.warn('Discovery search failed:', e);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'discover') {
        handleSearch();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.borderSubtle }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text variant="h2" weight="bold" color={colors.text}>
              Social
            </Text>
            <Text variant="caption" color={colors.textTertiary}>
              Atomic consistency is highly infectious.
            </Text>
          </View>
          
          <Pressable 
            onPress={() => {
              fetchSocialConnections();
              setFriendsListVisible(true);
            }} 
            style={[styles.companionsTriggerBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
          >
            <Users size={16} color={colors.primary} />
            {pendingRequests.length > 0 && (
              <View style={[styles.requestsCountBadge, { backgroundColor: colors.error }]}>
                <Text variant="micro" weight="bold" color="#FFFFFF" style={{ fontSize: 9, lineHeight: 11 }}>
                  {pendingRequests.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <Spacer size="sm" />

        {/* Tab switch segmented buttons */}
        <View style={[styles.tabSegment, { backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setActiveTab('feed')}
            style={[
              styles.tabBtn,
              activeTab === 'feed' && { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Users size={14} color={activeTab === 'feed' ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text variant="caption" weight="bold" color={activeTab === 'feed' ? colors.text : colors.textSecondary}>
              Activity Feed
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('discover')}
            style={[
              styles.tabBtn,
              activeTab === 'discover' && { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Compass size={14} color={activeTab === 'discover' ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
            <Text variant="caption" weight="bold" color={activeTab === 'discover' ? colors.text : colors.textSecondary}>
              Global Discovery
            </Text>
          </Pressable>
        </View>
      </View>

      {activeTab === 'feed' ? (
        /* ================= FEED SCREEN ================= */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <Spacer size="md" />

          {/* Quick Connect Friends Widget */}
          <Surface elevation="raised" borderRadius="2xl" bordered style={styles.addFriendCard}>
            <Text variant="bodySmall" weight="bold" color={colors.text}>
              Connect Habiteers
            </Text>
            <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 2, marginBottom: 10 }}>
              Connect with fellow high-performers to compile daily habits in public.
            </Text>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                <TextInput
                  placeholder="Enter companion username..."
                  placeholderTextColor={colors.textTertiary}
                  value={friendInput}
                  onChangeText={setFriendInput}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
              <Pressable
                onPress={() => handleAddFriend()}
                disabled={actionLoading}
                style={[styles.plusButton, { backgroundColor: colors.primary }]}
              >
                {actionLoading ? <ActivityIndicator size="small" color={colors.surface} /> : <Plus size={20} color={colors.surface} />}
              </Pressable>
            </View>
          </Surface>

          <Spacer size="md" />

          {loadingFeed ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Spacer size="xs" />
              <Text variant="caption" color={colors.textTertiary}>Loading activity feed...</Text>
            </View>
          ) : socialFeed.length === 0 ? (
            <Surface elevation="raised" borderRadius="2xl" bordered style={styles.emptyCard}>
              <Compass size={40} color={colors.textSecondary} style={{ opacity: 0.5, marginBottom: 12 }} />
              <Text variant="bodySmall" weight="bold" color={colors.textSecondary} align="center">
                No recent companion activity.
              </Text>
              <Text variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: 2, paddingHorizontal: 16 }}>
                Search for global users in the "Global Discovery" tab to start growing your social ecosystem!
              </Text>
            </Surface>
          ) : (
            socialFeed.map((item) => (
              <GlassCard key={item.id} borderRadius="2xl" style={styles.feedCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    <UserAvatar uri={item.user.avatar} username={item.user.username} size="sm" borderRankColor={colors.primary} />
                    <View>
                      <Text variant="bodySmall" weight="bold" color={colors.text}>
                        @{item.user.username}
                      </Text>
                      <Text variant="micro" color={colors.textTertiary}>
                        Level {item.user.level || 1} • {item.user.streak || 0}🔥 Streak
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text variant="micro" weight="bold" color={colors.primary}>
                      {item.challenge.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Completion Box */}
                <Surface elevation="raised" borderRadius="lg" bordered style={styles.completionBox}>
                  <Text variant="bodySmall" weight="bold" color={colors.text}>
                    Completed: {item.challenge.title}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, lineHeight: 18 }}>
                    {item.challenge.description}
                  </Text>
                </Surface>

                {/* Reactions list */}
                {item.reactions && item.reactions.length > 0 && (
                  <View style={styles.reactionsShelf}>
                    {item.reactions.slice(0, 4).map((react, rIdx) => (
                      <View key={rIdx} style={[styles.reactionPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                        <Text style={styles.reactionText}>
                          {react.emoji} <Text style={{ fontSize: 9, color: colors.textSecondary }}>@{react.username}</Text>
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Reaction Actions */}
                <View style={[styles.cardDivider, { backgroundColor: colors.borderSubtle }]} />
                <View style={styles.actionRow}>
                  <View style={styles.reactionButtons}>
                    {['🔥', '👏', '💪', '👑'].map((emoji) => (
                      <Pressable
                        key={emoji}
                        onPress={() => handleSendReaction(item.user.id, emoji)}
                        style={[styles.emojiButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                      >
                        <Text style={{ fontSize: 13 }}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Comment Threads Section */}
                <View style={[styles.cardDivider, { backgroundColor: colors.borderSubtle }]} />
                <View style={styles.commentsSection}>
                  {item.comments && item.comments.length > 0 ? (
                    item.comments.map((comment) => (
                      <View key={comment.id} style={styles.commentRow}>
                        <UserAvatar uri={comment.user.avatar} username={comment.user.username} size="sm" />
                        <View style={[styles.commentBubble, { backgroundColor: colors.surface }]}>
                          <Text variant="micro" weight="bold" color={colors.primary}>
                            @{comment.user.username}
                          </Text>
                          <Text variant="caption" color={colors.text} style={{ marginTop: 1 }}>
                            {comment.content}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : null}

                  {/* Comment Input */}
                  <View style={styles.commentInputRow}>
                    <View style={[styles.commentInputWrapper, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
                      <TextInput
                        placeholder="Write a supportive comment..."
                        placeholderTextColor={colors.textTertiary}
                        value={commentInputs[item.id] || ''}
                        onChangeText={(txt) => setCommentInputs(prev => ({ ...prev, [item.id]: txt }))}
                        style={[styles.commentInput, { color: colors.text }]}
                      />
                    </View>
                    <Pressable
                      onPress={() => handlePostComment(item.id)}
                      disabled={submittingComment[item.id]}
                      style={[styles.commentSendBtn, { backgroundColor: colors.primary }]}
                    >
                      {submittingComment[item.id] ? (
                        <ActivityIndicator size="small" color={colors.surface} />
                      ) : (
                        <Send size={12} color={colors.surface} />
                      )}
                    </Pressable>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
          <Spacer size="5xl" />
        </ScrollView>
      ) : (
        /* ================= DISCOVERY / SEARCH SCREEN ================= */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Spacer size="md" />

          {/* Unified Discovery Search Input */}
          <GlassCard borderRadius="2xl" style={styles.searchCard}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
              <Search size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Search global users or squads..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
          </GlassCard>

          <Spacer size="md" />

          {searching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Spacer size="xs" />
              <Text variant="caption" color={colors.textTertiary}>Searching database alliances...</Text>
            </View>
          ) : searchQuery.trim() === '' ? (
            /* Suggested / Empty state */
            <Surface elevation="raised" borderRadius="2xl" bordered style={styles.discoverEmptyCard}>
              <Compass size={32} color={colors.primary} style={{ marginBottom: 12 }} />
              <Text variant="body" weight="bold" color={colors.text} align="center">
                Search Unified Directory
              </Text>
              <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 4, paddingHorizontal: 16, lineHeight: 16 }}>
                Search global habiteers to add them to your daily companion feed, or look up active squads to join!
              </Text>
            </Surface>
          ) : (
            <View>
              {/* Users Results */}
              <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.resultTitle}>
                USERS FOUND ({searchUsers.length})
              </Text>

              <Surface elevation="raised" borderRadius="2xl" bordered style={styles.resultsList}>
                {searchUsers.length > 0 ? (
                  searchUsers.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.resultRow,
                        index < searchUsers.length - 1 && { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <View style={styles.resultRowLeft}>
                        <UserAvatar uri={item.avatar} username={item.username} size="sm" />
                        <View>
                          <Text variant="bodySmall" weight="bold" color={colors.text}>
                            @{item.username}
                          </Text>
                          <Text variant="micro" color={colors.textTertiary}>
                            Level {item.level || 1} • {item.xp || 0} XP
                          </Text>
                        </View>
                      </View>

                      {/* Add companion action */}
                      <Pressable
                        onPress={() => handleAddFriend(item.username)}
                        style={[styles.actionBtn, { backgroundColor: colors.primary + '20' }]}
                      >
                        <UserPlus size={14} color={colors.primary} />
                      </Pressable>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyResultsRow}>
                    <Text variant="caption" color={colors.textTertiary}>No users matching query found.</Text>
                  </View>
                )}
              </Surface>

              <Spacer size="lg" />

              {/* Squads Results */}
              <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.resultTitle}>
                ALLIANCES FOUND ({searchSquads.length})
              </Text>

              <Surface elevation="raised" borderRadius="2xl" bordered style={styles.resultsList}>
                {searchSquads.length > 0 ? (
                  searchSquads.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.resultRow,
                        index < searchSquads.length - 1 && { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <View style={styles.resultRowLeft}>
                        <UserAvatar uri={item.avatar} username={item.name} size="sm" borderRankColor={colors.accent} />
                        <View>
                          <Text variant="bodySmall" weight="bold" color={colors.text}>
                            {item.name}
                          </Text>
                          <Text variant="micro" color={colors.textTertiary}>
                            Alliance • Level {item.level || 1} • {item.xp} XP
                          </Text>
                        </View>
                      </View>

                      <View style={styles.squadBadge}>
                        <Text variant="micro" weight="bold" color={colors.accent}>ACTIVE</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyResultsRow}>
                    <Text variant="caption" color={colors.textTertiary}>No squads matching query found.</Text>
                  </View>
                )}
              </Surface>
            </View>
          )}

          <Spacer size="5xl" />
        </ScrollView>
      )}

      {/* Companions Alliance Modal Overlay */}
      <Modal visible={friendsListVisible} animationType="slide" transparent>
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: colors.background,
              paddingTop: Math.max(insets.top, 16) + 12,
              paddingBottom: Math.max(insets.bottom, 16) + 12,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text variant="h2" weight="bold" color={colors.text}>
                Companions Alliance
              </Text>
              <Text variant="caption" color={colors.textTertiary}>
                Grow and manage your habit sharing circle.
              </Text>
            </View>
            <Pressable
              onPress={() => setFriendsListVisible(false)}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceHover }]}
            >
              <X color={colors.text} size={18} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, width: '100%' }}>
            <Spacer size="md" />

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
              <View>
                <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.modalSectionTitle}>
                  PENDING INVITATION ALLIANCES ({pendingRequests.length})
                </Text>
                <Surface elevation="raised" borderRadius="2xl" bordered style={styles.allianceList}>
                  {pendingRequests.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.allianceRow,
                        index < pendingRequests.length - 1 && { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <View style={styles.allianceInfo}>
                        <UserAvatar uri={item.avatar} username={item.username} size="sm" />
                        <View>
                          <Text variant="bodySmall" weight="bold" color={colors.text}>
                            @{item.username}
                          </Text>
                          <Text variant="micro" color={colors.textTertiary}>
                            Level {item.level || 1} • Invites you
                          </Text>
                        </View>
                      </View>

                      <View style={styles.actionButtonsRow}>
                        <Pressable
                          onPress={() => handleAcceptFriend(item.id, item.username)}
                          style={[styles.modalActionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.15)', marginRight: 6 }]}
                        >
                          <UserCheck size={14} color={colors.success} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeclineFriend(item.id, item.username)}
                          style={[styles.modalActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
                        >
                          <X size={14} color={colors.error} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </Surface>
                <Spacer size="lg" />
              </View>
            )}

            {/* Active Friends List */}
            <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.modalSectionTitle}>
              ACTIVE ALLIANCES ({activeFriends.length})
            </Text>
            
            <Surface elevation="raised" borderRadius="2xl" bordered style={styles.allianceList}>
              {fetchingFriends ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : activeFriends.length === 0 ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <Users size={32} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <Text variant="bodySmall" color={colors.textTertiary} align="center">
                    No active habit companions.
                  </Text>
                  <Text variant="micro" color={colors.textTertiary} align="center" style={{ marginTop: 2, paddingHorizontal: 16 }}>
                    Search and invite other high-performers to start tracking streak progress in public!
                  </Text>
                </View>
              ) : (
                activeFriends.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.allianceRow,
                      index < activeFriends.length - 1 && { borderBottomColor: colors.borderSubtle },
                    ]}
                  >
                    <View style={styles.allianceInfo}>
                      <UserAvatar uri={item.avatar} username={item.username} size="sm" borderRankColor={colors.primary} />
                      <View>
                        <Text variant="bodySmall" weight="bold" color={colors.text}>
                          @{item.username}
                        </Text>
                        <Text variant="micro" color={colors.textTertiary}>
                          Level {item.level || 1} • {item.streak || 0}🔥 Streak • {item.xp || 0} XP
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleRemoveFriend(item.id, item.username)}
                      style={[styles.modalActionBtn, { backgroundColor: colors.surfaceElevated }]}
                    >
                      <UserMinus size={14} color={colors.error} />
                    </Pressable>
                  </View>
                ))
              )}
            </Surface>
            <Spacer size="5xl" />
          </ScrollView>
        </View>
      </Modal>
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
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabSegment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  addFriendCard: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedCard: {
    padding: 16,
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  completionBox: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  reactionsShelf: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  reactionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  reactionText: {
    fontSize: 10,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    marginVertical: 8,
    opacity: 0.8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsSection: {
    marginTop: 8,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  commentBubble: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  commentInputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    height: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  commentInput: {
    fontSize: 12,
    height: '100%',
    padding: 0,
  },
  commentSendBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  discoverEmptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    marginLeft: 4,
    marginBottom: 6,
    letterSpacing: 1,
    marginTop: 12,
  },
  resultsList: {
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  resultRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
  },
  emptyResultsRow: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionsTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  requestsCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSectionTitle: {
    marginLeft: 4,
    marginBottom: 6,
    letterSpacing: 1,
    marginTop: 12,
  },
  allianceList: {
    overflow: 'hidden',
  },
  allianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  allianceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
