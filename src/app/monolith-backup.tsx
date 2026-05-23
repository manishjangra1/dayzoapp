import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, User } from '../store/authStore';
import api, { API_URL } from '../services/api';
import { triggerConfetti } from '../utils/confetti';

// Reusable Components
import StreakFlame from '../components/StreakFlame';
import XPBar from '../components/XPBar';
import ShareCard from '../components/ShareCard';
import AchievementModal from '../components/AchievementModal';

// Icons
import {
  Flame,
  Zap,
  Award,
  Users,
  Trophy,
  User as UserIcon,
  LogOut,
  Plus,
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  Lock,
  Mail,
  Send,
  Heart,
  Smile,
  AlertTriangle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, token, isAuthenticated, setAuth, clearAuth, updateUser, initialize } = useAuthStore();

  // Core App States
  const [activeTab, setActiveTab] = useState<'home' | 'social' | 'leaderboard' | 'profile'>('home');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingInterests, setOnboardingInterests] = useState<string[]>([]);
  const [onboardingUsername, setOnboardingUsername] = useState<string>('');

  // API Data States
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [challengeCompletedToday, setChallengeCompletedToday] = useState<boolean>(false);
  const [challengeHistory, setChallengeHistory] = useState<any[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<any[]>([]);
  const [socialFeed, setSocialFeed] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [leaderboardScope, setLeaderboardScope] = useState<'global' | 'friends'>('global');

  // Input States
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [friendInput, setFriendInput] = useState<string>('');

  // Modals & Celebrations
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [celebrationVisible, setCelebrationVisible] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    type: 'LEVEL_UP' | 'BADGE';
    title: string;
    subtitle: string;
    icon?: string;
  }>({ type: 'LEVEL_UP', title: '', subtitle: '' });

  // System States
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // 1. Session Restoration on mount
  useEffect(() => {
    async function restoreSession() {
      await initialize();
      setLoading(false);
    }
    restoreSession();
  }, []);

  // 2. Fetch all dynamic API resources once authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      // Check if onboarded (User interests populated)
      if (user?.xp && user.xp > 0) {
        setOnboarded(true);
      }
      fetchAllData();
    }
  }, [isAuthenticated, token]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // A. Load active rotating challenge
      const resChallenge = await api.get('/challenges/today');
      setTodayChallenge(resChallenge.data);

      // B. Load profile statistics
      const resProfile = await api.get('/users/profile');
      updateUser(resProfile.data);

      // C. Load challenge history
      const resHistory = await api.get('/challenges/history');
      setChallengeHistory(resHistory.data);

      // Check if today's challenge is already completed in history
      const completedToday = resHistory.data.some((h: any) => {
        if (!h.completed) return false;
        const compDate = new Date(h.createdAt);
        const today = new Date();
        return compDate.toDateString() === today.toDateString();
      });
      setChallengeCompletedToday(completedToday);

      // D. Load Global and Friends Leaderboard rankings
      const resGlobal = await api.get('/leaderboard/global');
      setGlobalLeaderboard(resGlobal.data);

      try {
        const resFriendsLd = await api.get('/leaderboard/friends');
        setFriendsLeaderboard(resFriendsLd.data);
      } catch (e) {
        setFriendsLeaderboard([]);
      }

      // E. Load Friend listings and Activity Feed
      const resFriends = await api.get('/social/friends');
      setFriends(resFriends.data);

      const resFeed = await api.get('/social/feed');
      setSocialFeed(resFeed.data);

    } catch (e) {
      console.warn('Network error loading API data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auth Operations
  const handleLogin = async () => {
    if (!authEmail || !authPassword) {
      showAlert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post('/auth/login', {
        emailOrUsername: authEmail.trim(),
        password: authPassword,
      });
      await setAuth(res.data.accessToken, res.data.user);
      setOnboarded(true); // login bypasses onboarding screen
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!authEmail || !authUsername || !authPassword) {
      showAlert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post('/auth/register', {
        email: authEmail.trim(),
        username: authUsername.trim().toLowerCase(),
        password: authPassword,
      });
      await setAuth(res.data.accessToken, res.data.user);
      setOnboardingUsername(res.data.user.username);
      setOnboarded(false); // triggers onboarding flow
      setOnboardingStep(1);
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Registration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAuth();
    setOnboarded(false);
    setAuthEmail('');
    setAuthPassword('');
    setAuthUsername('');
  };

  // Onboarding operations
  const handleSaveOnboarding = async () => {
    if (onboardingInterests.length === 0) {
      showAlert('Selection Required', 'Please select at least one interest.');
      return;
    }
    try {
      setActionLoading(true);
      // Save interests, trigger virtual starting XP
      const res = await api.patch('/users/profile', {
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${onboardingUsername || 'user'}`,
      });
      updateUser(res.data);
      setOnboarded(true);
      setActiveTab('home');
      // Force refresh data
      await fetchAllData();
    } catch (e) {
      console.warn(e);
      setOnboarded(true); // Safe fallback
    } finally {
      setActionLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (onboardingInterests.includes(interest)) {
      setOnboardingInterests(onboardingInterests.filter((i) => i !== interest));
    } else {
      setOnboardingInterests([...onboardingInterests, interest]);
    }
  };

  // Daily Challenge operations
  const handleCompleteChallenge = async () => {
    if (!todayChallenge) return;
    try {
      setActionLoading(true);
      const res = await api.post('/challenges/complete');
      
      // Update store user profile
      updateUser(res.data.user);
      setChallengeCompletedToday(true);
      
      // Fire confetti animation
      triggerConfetti();

      // Check level up celebration
      if (res.data.levelUp) {
        setCelebrationDetails({
          type: 'LEVEL_UP',
          title: `Rank: ${res.data.user.title}!`,
          subtitle: `Congratulations! You promoted to Level ${res.data.newLevel} and earned +${res.data.xpGained} XP!`,
        });
        setTimeout(() => setCelebrationVisible(true), 800);
      } else if (res.data.unlockedBadges && res.data.unlockedBadges.length > 0) {
        const badge = res.data.unlockedBadges[0];
        setCelebrationDetails({
          type: 'BADGE',
          title: badge.title,
          subtitle: badge.description,
          icon: badge.icon,
        });
        setTimeout(() => setCelebrationVisible(true), 800);
      } else {
        // Safe dopamine summary alert
        showAlert('Completed! 🔥', `Earned +${res.data.xpGained} XP! Streak increased to ${res.data.streakUpdated} days!`);
      }

      await fetchAllData();
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Failed to complete challenge.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipChallenge = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/challenges/skip');
      updateUser(res.data.user);
      await fetchAllData();
      showAlert('Skipped', `Challenge skipped. Remaining streak freezes: ${res.data.streakFreezes}`);
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Failed to skip challenge.');
    } finally {
      setActionLoading(false);
    }
  };

  // Social friend request addition
  const handleAddFriend = async () => {
    if (!friendInput) return;
    try {
      setActionLoading(true);
      const res = await api.post('/social/request', {
        username: friendInput.trim().toLowerCase(),
      });
      showAlert('Success', res.data.message);
      setFriendInput('');
      await fetchAllData();
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Failed to send request.');
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
      // Instant updates locally
      setSocialFeed(
        socialFeed.map((item) => {
          if (item.userId === targetUserId) {
            return {
              ...item,
              reactions: [...(item.reactions || []), { username: user?.username || 'You', emoji }],
            };
          }
          return item;
        }),
      );
    } catch (e) {
      console.warn('React error:', e);
    }
  };

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  // -------------------------------------------------------------
  // RENDERING HELPERS
  // -------------------------------------------------------------

  if (loading) {
    return (
      <View className="flex-1 bg-darkBg justify-center items-center">
        <ActivityIndicator size="large" color="#FF4B2B" />
        <Text className="text-white/60 text-xs font-black tracking-widest uppercase mt-4">
          Dayzo Loading...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return renderAuthView();
  }

  if (!onboarded) {
    return renderOnboardingView();
  }

  return (
    <SafeAreaView className="flex-1 bg-darkBg">
      {/* Dynamic Celebration Popups */}
      <AchievementModal
        visible={celebrationVisible}
        onClose={() => setCelebrationVisible(false)}
        type={celebrationDetails.type}
        title={celebrationDetails.title}
        subtitle={celebrationDetails.subtitle}
        icon={celebrationDetails.icon}
      />

      {/* Vertical 9:16 Instagram Share Card Modal */}
      <ShareCard
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        username={user?.username || 'user'}
        streak={user?.streak || 0}
        xp={todayChallenge?.xpReward || 0}
        levelTitle={user?.title || 'Rookie'}
        challengeTitle={todayChallenge?.title || 'Challenge'}
      />

      <View className="flex-1 relative">
        <ScrollView className="flex-1 px-4 pt-6 pb-24" showsVerticalScrollIndicator={false}>
          {activeTab === 'home' && renderHomeTab()}
          {activeTab === 'social' && renderSocialTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
          {activeTab === 'profile' && renderProfileTab()}
        </ScrollView>

        {/* Cinematic Tab Navigation Bar at Bottom */}
        <View className="absolute bottom-6 left-4 right-4 bg-darkCard/95 border border-white/10 h-16 rounded-full flex-row justify-around items-center px-4 shadow-xl shadow-black/50">
          <TouchableOpacity
            onPress={() => setActiveTab('home')}
            className={`items-center justify-center p-2 rounded-full ${activeTab === 'home' ? 'bg-primaryOrange/20' : ''}`}
          >
            <Flame color={activeTab === 'home' ? '#FF4B2B' : '#fff'} size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('social')}
            className={`items-center justify-center p-2 rounded-full ${activeTab === 'social' ? 'bg-mintGreen/20' : ''}`}
          >
            <Compass color={activeTab === 'social' ? '#00F2FE' : '#fff'} size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('leaderboard')}
            className={`items-center justify-center p-2 rounded-full ${activeTab === 'leaderboard' ? 'bg-xpPurple/20' : ''}`}
          >
            <Trophy color={activeTab === 'leaderboard' ? '#8A2387' : '#fff'} size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('profile')}
            className={`items-center justify-center p-2 rounded-full ${activeTab === 'profile' ? 'bg-white/10' : ''}`}
          >
            <UserIcon color={activeTab === 'profile' ? '#fff' : '#fff'} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  // -------------------------------------------------------------
  // VIEW: 1. AUTH SCREEN
  // -------------------------------------------------------------
  function renderAuthView() {
    const isLogin = authView === 'login';
    return (
      <SafeAreaView className="flex-1 bg-darkBg justify-center items-center px-6">
        <View className="w-full max-w-[340px]">
          
          {/* Logo Title */}
          <View className="items-center mb-10">
            <Text className="text-white text-5xl font-black tracking-tighter">
              DAYZO
            </Text>
            <Text className="text-primaryOrange text-xs font-black uppercase tracking-widest mt-1">
              Win your day.
            </Text>
          </View>

          {/* Glowing Form Box */}
          <View className="bg-darkCard border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <Text className="text-white text-xl font-black mb-6 uppercase tracking-wider">
              {isLogin ? 'Welcome Back' : 'Get Locked In'}
            </Text>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">
                {isLogin ? 'Email or Username' : 'Email Address'}
              </Text>
              <TextInput
                placeholder={isLogin ? 'Enter details...' : 'user@example.com'}
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={authEmail}
                onChangeText={setAuthEmail}
                autoCapitalize="none"
                className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white text-sm focus:border-primaryOrange"
              />
            </View>

            {/* Username for registration */}
            {!isLogin && (
              <View className="mb-4">
                <Text className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">
                  Dayzo Username
                </Text>
                <TextInput
                  placeholder="streak_king"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={authUsername}
                  onChangeText={setAuthUsername}
                  autoCapitalize="none"
                  className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white text-sm focus:border-primaryOrange"
                />
              </View>
            )}

            {/* Password */}
            <View className="mb-6">
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">
                Secure Password
              </Text>
              <TextInput
                placeholder="••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry
                className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white text-sm focus:border-primaryOrange"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={actionLoading}
              className="w-full bg-primaryOrange h-14 rounded-2xl justify-center items-center active:scale-95 transition-all shadow-lg shadow-primaryOrange/20"
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-black uppercase tracking-wider">
                  {isLogin ? 'Enter Dashboard' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Swap Auth View CTA */}
          <TouchableOpacity
            onPress={() => setAuthView(isLogin ? 'register' : 'login')}
            className="items-center mt-6"
          >
            <Text className="text-white/60 text-xs font-semibold">
              {isLogin ? "New to Dayzo? " : "Already have an account? "}
              <Text className="text-primaryOrange font-black">
                {isLogin ? 'Sign Up' : 'Log In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW: 2. ONBOARDING
  // -------------------------------------------------------------
  function renderOnboardingView() {
    const interests = ['fitness', 'productivity', 'studying', 'coding', 'mindfulness'];
    
    return (
      <SafeAreaView className="flex-1 bg-darkBg justify-center items-center px-6">
        <View className="w-full max-w-[340px]">
          
          <View className="items-center mb-8">
            <Sparkles color="#00F2FE" size={40} className="mb-2 animate-bounce" />
            <Text className="text-white text-3xl font-black tracking-tight text-center leading-tight">
              Win Your Day.
            </Text>
            <Text className="text-white/60 text-xs font-bold text-center mt-1">
              Onboarding: Set your challenge categories!
            </Text>
          </View>

          {/* Interests Card Selection Box */}
          <View className="bg-darkCard border border-white/10 rounded-3xl p-6 shadow-2xl">
            <Text className="text-white text-lg font-black mb-4 uppercase tracking-wider">
              Select Interests
            </Text>

            <ScrollView className="max-h-60 mb-6" showsVerticalScrollIndicator={false}>
              {interests.map((interest) => {
                const selected = onboardingInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    className={`w-full h-12 border rounded-xl flex-row items-center px-4 mb-3 ${selected ? 'border-primaryOrange bg-primaryOrange/10' : 'border-white/10 bg-white/5'}`}
                  >
                    <CheckCircle2 color={selected ? '#FF4B2B' : '#fff'} size={20} className="mr-3" />
                    <Text className="text-white text-sm font-bold uppercase tracking-wider">
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={handleSaveOnboarding}
              disabled={actionLoading}
              className="w-full bg-primaryOrange h-14 rounded-2xl justify-center items-center active:scale-95 transition-all shadow-lg"
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-black uppercase tracking-wider">
                  Lets Go! 🚀
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // TAB: 1. HOME DASHBOARD
  // -------------------------------------------------------------
  function renderHomeTab() {
    return (
      <View className="pb-24">
        
        {/* Top App Bar Stats */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest">
              Level {user?.level || 1} • {user?.title || 'Rookie'}
            </Text>
            <Text className="text-white text-2xl font-black tracking-tight mt-0.5">
              DAYZO
            </Text>
          </View>
          <StreakFlame streak={user?.streak || 0} />
        </View>

        {/* Dynamic Motivation scrolling banner */}
        <View className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center mb-6">
          <Sparkles color="#00F2FE" size={20} className="mr-3" />
          <View className="flex-1">
            <Text className="text-white/80 text-xs font-semibold italic">
              "discipline over motivation. lock in and win."
            </Text>
          </View>
        </View>

        {/* Dynamic XP Progress Bar */}
        <View className="bg-darkCard border border-white/10 rounded-3xl p-5 mb-6 shadow-md">
          <XPBar xp={user?.xp || 0} level={user?.level || 1} />
        </View>

        {/* Dominant challenge card */}
        <Text className="text-white/60 text-xs font-black uppercase tracking-widest mb-3 ml-1">
          Today's Challenge
        </Text>
        
        {todayChallenge ? (
          <View className="bg-darkCard border border-white/10 rounded-3xl p-6 mb-6 shadow-lg shadow-black/30 relative overflow-hidden">
            
            {/* Glowing Category Banner */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="bg-primaryOrange/20 border border-primaryOrange/40 px-3 py-1 rounded-full">
                <Text className="text-primaryOrange text-[9px] font-black uppercase tracking-widest">
                  {todayChallenge.category}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-white/40 text-[10px] font-black uppercase">
                  {todayChallenge.duration} mins • {todayChallenge.difficulty}
                </Text>
              </View>
            </View>

            {/* Title & Desc */}
            <Text className="text-white text-3xl font-black tracking-tight mb-2">
              {todayChallenge.title}
            </Text>
            <Text className="text-white/60 text-sm font-medium leading-relaxed mb-6">
              {todayChallenge.description}
            </Text>

            {/* XP Value pill */}
            <View className="flex-row items-center mb-8">
              <Zap color="#00F2FE" size={16} className="mr-1.5" />
              <Text className="text-white text-sm font-black uppercase tracking-wider">
                +{todayChallenge.xpReward} XP Reward
              </Text>
            </View>

            {/* Complete challenge CTA or finished states */}
            {challengeCompletedToday ? (
              <View className="w-full">
                <View className="w-full bg-emerald-500/10 border border-emerald-500/20 h-14 rounded-2xl justify-center items-center flex-row mb-3">
                  <CheckCircle2 color="#10B981" size={20} className="mr-2" />
                  <Text className="text-emerald-500 text-sm font-black uppercase tracking-widest">
                    Challenge Complete!
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => setShowShareModal(true)}
                  className="w-full bg-white/5 border border-white/10 h-12 rounded-xl justify-center items-center flex-row"
                >
                  <Text className="text-white text-xs font-black uppercase tracking-widest">
                    View Story Share Card 🔥
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleSkipChallenge}
                  disabled={actionLoading}
                  className="flex-1 bg-white/5 border border-white/10 h-14 rounded-2xl justify-center items-center active:bg-white/10"
                >
                  <Text className="text-white/60 text-sm font-black uppercase tracking-wider">
                    Use Freeze ❄️
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCompleteChallenge}
                  disabled={actionLoading}
                  className="flex-[2] bg-primaryOrange h-14 rounded-2xl justify-center items-center active:scale-95 shadow-lg shadow-primaryOrange/20"
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-base font-black uppercase tracking-wider">
                      Done! 🔥
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View className="bg-darkCard border border-white/10 rounded-3xl p-6 justify-center items-center">
            <ActivityIndicator color="#FF4B2B" />
          </View>
        )}
      </View>
    );
  }

  // -------------------------------------------------------------
  // TAB: 2. SOCIAL FEED
  // -------------------------------------------------------------
  function renderSocialTab() {
    return (
      <View className="pb-24">
        
        {/* Friend Addition input */}
        <View className="bg-darkCard border border-white/10 rounded-3xl p-5 mb-6">
          <Text className="text-white text-lg font-black mb-3 uppercase tracking-wider">
            Challenge Friends
          </Text>
          <View className="flex-row">
            <TextInput
              placeholder="Friend username..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={friendInput}
              onChangeText={setFriendInput}
              autoCapitalize="none"
              className="flex-1 bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white text-sm focus:border-primaryOrange mr-3"
            />
            <TouchableOpacity
              onPress={handleAddFriend}
              disabled={actionLoading}
              className="bg-primaryOrange px-4 rounded-xl justify-center items-center active:scale-95"
            >
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Friends listing feed */}
        <Text className="text-white/60 text-xs font-black uppercase tracking-widest mb-3 ml-1">
          Friend Activity Feed
        </Text>

        {socialFeed.length === 0 ? (
          <View className="bg-darkCard border border-white/10 rounded-3xl p-8 justify-center items-center">
            <Users color="rgba(255,255,255,0.3)" size={48} className="mb-3" />
            <Text className="text-white/60 text-sm font-black text-center">
              No friend activity yet. Add friends above to start competing!
            </Text>
          </View>
        ) : (
          socialFeed.map((item, idx) => (
            <View key={idx} className="bg-darkCard border border-white/10 rounded-3xl p-5 mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/5 border border-white/10 rounded-full justify-center items-center mr-3">
                    <Text className="text-white font-black text-xs">
                      {item.user.username.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm font-black">
                      @{item.user.username}
                    </Text>
                    <Text className="text-white/40 text-[9px] font-black uppercase">
                      Lvl {item.user.level} • {item.user.streak}🔥 Streak
                    </Text>
                  </View>
                </View>
                <View className="bg-primaryOrange/10 border border-primaryOrange/20 px-2 py-0.5 rounded-full">
                  <Text className="text-primaryOrange text-[8px] font-black uppercase tracking-wider">
                    {item.challenge.category}
                  </Text>
                </View>
              </View>

              {/* Challenge Details */}
              <View className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                <Text className="text-white text-base font-black mb-1">
                  {item.challenge.title}
                </Text>
                <Text className="text-white/60 text-xs font-semibold leading-relaxed">
                  {item.challenge.description}
                </Text>
              </View>

              {/* Reactions shelf */}
              <View className="flex-row items-center justify-between border-t border-white/5 pt-3">
                <View className="flex-row gap-2">
                  {item.reactions && item.reactions.slice(0, 4).map((r: any, rIdx: number) => (
                    <View key={rIdx} className="bg-white/5 px-2 py-1 rounded-full border border-white/5">
                      <Text className="text-[10px] text-white">
                        {r.emoji} <Text className="text-white/40 font-bold">{r.username}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
                
                {/* Emoji picker haptics */}
                <View className="flex-row gap-1">
                  {['🔥', '👏', '💪'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => handleSendReaction(item.user.id, emoji)}
                      className="p-1.5 bg-white/5 rounded-full border border-white/5"
                    >
                      <Text className="text-xs">{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    );
  }

  // -------------------------------------------------------------
  // TAB: 3. LEADERBOARDS
  // -------------------------------------------------------------
  function renderLeaderboardTab() {
    const list = leaderboardScope === 'global' ? globalLeaderboard : friendsLeaderboard;
    const top3 = list.slice(0, 3);
    const remainder = list.slice(3);

    return (
      <View className="pb-24">
        
        {/* Toggle global/friends */}
        <View className="bg-darkCard border border-white/10 rounded-full flex-row p-1 mb-6">
          <TouchableOpacity
            onPress={() => setLeaderboardScope('global')}
            className={`flex-1 py-2.5 rounded-full items-center ${leaderboardScope === 'global' ? 'bg-primaryOrange' : ''}`}
          >
            <Text className="text-white text-xs font-black uppercase tracking-wider">
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLeaderboardScope('friends')}
            className={`flex-1 py-2.5 rounded-full items-center ${leaderboardScope === 'friends' ? 'bg-primaryOrange' : ''}`}
          >
            <Text className="text-white text-xs font-black uppercase tracking-wider">
              Friends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Podium spotlights for Top 3 */}
        {top3.length > 0 && (
          <View className="flex-row items-end justify-center mb-8 h-48 px-2">
            
            {/* Rank 2 Podium Spot */}
            {top3[1] && (
              <View className="items-center flex-1 mx-1">
                <View className="w-12 h-12 bg-white/5 border border-white/10 rounded-full justify-center items-center mb-2">
                  <Text className="text-white font-black text-[10px]">
                    {top3[1].username.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-white/60 text-xs font-black text-center" numberOfLines={1}>
                  @{top3[1].username}
                </Text>
                <Text className="text-primaryOrange text-[9px] font-black uppercase">
                  {top3[1].xp} XP
                </Text>
                <View className="w-full bg-white/5 border-t border-x border-white/10 h-16 rounded-t-xl justify-center items-center mt-2">
                  <Text className="text-white/40 text-lg font-black">2</Text>
                </View>
              </View>
            )}

            {/* Rank 1 Center Spotlight Spot */}
            {top3[0] && (
              <View className="items-center flex-1 mx-1 z-10 scale-105">
                <View className="w-16 h-16 bg-primaryOrange/10 border-2 border-primaryOrange rounded-full justify-center items-center mb-2 shadow-lg shadow-primaryOrange/30">
                  <Text className="text-white font-black text-xs">
                    {top3[0].username.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-white text-sm font-black text-center" numberOfLines={1}>
                  @{top3[0].username}
                </Text>
                <Text className="text-primaryOrange text-xs font-black uppercase">
                  {top3[0].xp} XP
                </Text>
                <View className="w-full bg-primaryOrange/10 border-t-2 border-x-2 border-primaryOrange h-24 rounded-t-xl justify-center items-center mt-2">
                  <Trophy color="#FF4B2B" size={24} className="mb-1" />
                  <Text className="text-white text-xl font-black">1</Text>
                </View>
              </View>
            )}

            {/* Rank 3 Podium Spot */}
            {top3[2] && (
              <View className="items-center flex-1 mx-1">
                <View className="w-12 h-12 bg-white/5 border border-white/10 rounded-full justify-center items-center mb-2">
                  <Text className="text-white font-black text-[10px]">
                    {top3[2].username.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-white/60 text-xs font-black text-center" numberOfLines={1}>
                  @{top3[2].username}
                </Text>
                <Text className="text-primaryOrange text-[9px] font-black uppercase">
                  {top3[2].xp} XP
                </Text>
                <View className="w-full bg-white/5 border-t border-x border-white/10 h-12 rounded-t-xl justify-center items-center mt-2">
                  <Text className="text-white/40 text-base font-black">3</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Scroll list of other competitors */}
        <View className="bg-darkCard border border-white/10 rounded-3xl overflow-hidden">
          {remainder.length === 0 && top3.length <= 3 && remainder.length === 0 && list.length === 0 ? (
            <View className="p-8 items-center justify-center">
              <Trophy color="rgba(255,255,255,0.2)" size={40} className="mb-2" />
              <Text className="text-white/40 text-xs font-black uppercase">
                No rankings listed
              </Text>
            </View>
          ) : (
            remainder.map((item, idx) => (
              <View
                key={idx}
                className="flex-row items-center justify-between px-5 py-4 border-b border-white/5 active:bg-white/5"
              >
                <View className="flex-row items-center">
                  <Text className="text-white/40 text-sm font-black w-6 text-center">
                    {idx + 4}
                  </Text>
                  <View className="w-8 h-8 bg-white/5 border border-white/10 rounded-full justify-center items-center mx-3">
                    <Text className="text-white font-black text-[10px]">
                      {item.username.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm font-black">
                      @{item.username}
                    </Text>
                    <Text className="text-white/40 text-[8px] font-black uppercase">
                      Lvl {item.level} • {item.title}
                    </Text>
                  </View>
                </View>

                {/* Score */}
                <View className="items-end">
                  <Text className="text-white text-sm font-black">
                    {item.xp} XP
                  </Text>
                  <Text className="text-primaryOrange text-[8px] font-black uppercase">
                    {item.streak}🔥 streak
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // TAB: 4. PROFILE SCREEN
  // -------------------------------------------------------------
  function renderProfileTab() {
    return (
      <View className="pb-24">
        
        {/* Master Dayzo ID card */}
        <View className="bg-darkCard border-2 border-primaryOrange/30 rounded-3xl p-6 mb-6 shadow-lg shadow-primaryOrange/10 relative overflow-hidden">
          <View className="absolute -top-10 -right-10 w-36 h-36 bg-primaryOrange/10 rounded-full blur-3xl" />
          
          <View className="flex-row justify-between items-center mb-6">
            <View className="w-14 h-14 bg-white/5 border border-white/10 rounded-full justify-center items-center">
              <Text className="text-white font-black text-base">
                {user?.username.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest">
                System Rank
              </Text>
              <Text className="text-primaryOrange text-lg font-black uppercase tracking-tighter">
                {user?.title || 'Rookie'}
              </Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-black mb-1">
            @{user?.username}
          </Text>
          <Text className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-6">
            Dayzo user since May 2026
          </Text>

          {/* User Core Stats */}
          <View className="border-t border-white/10 pt-4 flex-row justify-between">
            <View>
              <Text className="text-white text-lg font-black">{user?.xp || 0}</Text>
              <Text className="text-white/40 text-[9px] font-black uppercase">Total XP</Text>
            </View>
            <View>
              <Text className="text-white text-lg font-black">{user?.level || 1}</Text>
              <Text className="text-white/40 text-[9px] font-black uppercase">Level</Text>
            </View>
            <View>
              <Text className="text-white text-lg font-black">{user?.streak || 0} 🔥</Text>
              <Text className="text-white/40 text-[9px] font-black uppercase">Streak</Text>
            </View>
            <View>
              <Text className="text-white text-lg font-black">{user?.longestStreak || 0} 👑</Text>
              <Text className="text-white/40 text-[9px] font-black uppercase">Longest</Text>
            </View>
          </View>
        </View>

        {/* Badges shelves */}
        <Text className="text-white/60 text-xs font-black uppercase tracking-widest mb-3 ml-1">
          Unlocked Achievements
        </Text>

        <View className="bg-darkCard border border-white/10 rounded-3xl p-5 mb-6">
          {user?.badges && user.badges.length > 0 ? (
            <View className="flex-row flex-wrap gap-4">
              {user.badges.map((b) => (
                <View key={b.id} className="items-center justify-center w-16 h-20 bg-white/5 border border-white/5 rounded-2xl p-2 relative">
                  <Text className="text-3xl mb-1">{b.icon}</Text>
                  <Text className="text-white text-[8px] font-black uppercase text-center" numberOfLines={1}>
                    {b.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-4">
              <Award color="rgba(255,255,255,0.2)" size={32} className="mb-2" />
              <Text className="text-white/50 text-[10px] font-black uppercase text-center">
                Complete your first challenge to unlock badges!
              </Text>
            </View>
          )}
        </View>

        {/* Custom Actions settings */}
        <View className="bg-darkCard border border-white/10 rounded-3xl overflow-hidden mb-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center px-5 py-4 border-b border-white/5 active:bg-white/5"
          >
            <LogOut color="#EF4444" size={18} className="mr-3" />
            <Text className="text-red-500 text-sm font-black uppercase tracking-wider">
              Log Out Session
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
