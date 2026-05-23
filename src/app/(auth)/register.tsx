import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Alert, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Mail, Lock, User } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Gradient } from '../../design-system/primitives/Gradient';
import { radius } from '../../design-system/tokens/radius';

export default function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('Required Fields', 'Please enter your email, username, and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        email: email.trim(),
        username: username.trim().toLowerCase(),
        password,
      });

      await setAuth(res.data.accessToken, res.data.user);
      
      // Since it's a new registration, send them to Onboarding flow!
      router.replace('/(onboarding)/welcome');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Username or email already exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Gradient type="midnight" style={styles.container}>
      {/* Background soft glowing decorative orbs */}
      <View style={[styles.glowOrb, { backgroundColor: colors.accent, top: '10%', right: '-15%' }]} />
      <View style={[styles.glowOrb2, { backgroundColor: colors.primary, bottom: '15%', left: '-15%' }]} />

      <View style={styles.innerContainer}>
        {/* App Logo */}
        <View style={styles.logoWrapper}>
          <Flame size={48} color="#FF4B2B" fill="#FF4B2B" />
          <Text variant="hero" weight="display" color={colors.text} style={styles.logoText}>
            Dayzo
          </Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.subtitle}>
            Build atomic consistency together.
          </Text>
        </View>

        <Spacer size="xl" />

        {/* Form Card */}
        <GlassCard borderRadius="2xl" style={styles.card}>
          <Text variant="h3" weight="bold" color={colors.text}>
            Join the Ecosystem
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            Create your account to start your self-improvement track
          </Text>

          <Spacer size="lg" />

          {/* Email input field */}
          <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
            <Mail size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Spacer size="md" />

          {/* Username input field */}
          <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
            <User size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Pick a Username"
              placeholderTextColor={colors.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Spacer size="md" />

          {/* Password input field */}
          <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
            <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              placeholder="Create Password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Spacer size="xl" />

          <AnimatedButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            borderRadius="md"
          />
        </GlassCard>

        <Spacer size="lg" />

        {/* Navigation back to login */}
        <View style={styles.footer}>
          <Text variant="bodySmall" color={colors.textSecondary}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text variant="bodySmall" weight="bold" color={colors.primary}>
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    marginTop: 8,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  glowOrb: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.12,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.8,
        shadowRadius: 100,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  glowOrb2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.08,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.8,
        shadowRadius: 120,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
