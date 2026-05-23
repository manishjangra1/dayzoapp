import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Mail, Lock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { useDialog } from '../../design-system/theme/DialogProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Gradient } from '../../design-system/primitives/Gradient';
import { radius } from '../../design-system/tokens/radius';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const dialog = useDialog();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      dialog.show({
        title: 'Required Fields',
        message: 'Please enter your email or username and password.',
        primaryAction: { text: 'OK' }
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        emailOrUsername: emailOrUsername.trim(),
        password,
      });
      
      await setAuth(res.data.accessToken, res.data.user);
      
      // Go to home if they already have XP/onboarded, otherwise welcome
      const hasOnboarded = res.data.user && res.data.user.xp !== undefined && res.data.user.xp > 0;
      if (hasOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    } catch (e: any) {
      dialog.show({
        title: 'Login Failed',
        message: e.response?.data?.message || 'Invalid username/email or password.',
        primaryAction: { text: 'OK', variant: 'primary' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Gradient type="midnight" style={styles.container}>
      {/* Background soft glowing decorative orbs */}
      <View style={[styles.glowOrb, { backgroundColor: colors.primary, top: '15%', left: '-10%' }]} />
      <View style={[styles.glowOrb2, { backgroundColor: colors.accent, bottom: '10%', right: '-10%' }]} />

      <View style={styles.innerContainer}>
        {/* App Logo */}
        <View style={styles.logoWrapper}>
          <Flame size={48} color="#FF4B2B" fill="#FF4B2B" />
          <Text variant="hero" weight="display" color="#FFFFFF" style={styles.logoText}>
            Dayzo
          </Text>
          <Text variant="bodySmall" color="rgba(255, 255, 255, 0.6)" style={styles.subtitle}>
            Level up your lifestyle, daily.
          </Text>
        </View>

        <Spacer size="xl" />

        {/* Input fields in glassmorphic card */}
        <GlassCard borderRadius="2xl" style={[styles.card, { backgroundColor: 'rgba(20, 20, 26, 0.65)', borderColor: 'rgba(255, 255, 255, 0.12)' }]}>
          <Text variant="h3" weight="bold" color="#FFFFFF">
            Welcome Back
          </Text>
          <Text variant="caption" color="rgba(255, 255, 255, 0.5)">
            Sign in to resume your active habits
          </Text>

          <Spacer size="lg" />

          {/* Email input field */}
          <View style={[styles.inputContainer, { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Mail size={18} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
            <TextInput
              placeholder="Username or Email"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              autoCapitalize="none"
              style={[styles.input, { color: '#FFFFFF' }]}
            />
          </View>

          <Spacer size="md" />

          {/* Password input field */}
          <View style={[styles.inputContainer, { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Lock size={18} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, { color: '#FFFFFF' }]}
            />
          </View>

          <Spacer size="xl" />

          <AnimatedButton
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            borderRadius="md"
          />
        </GlassCard>

        <Spacer size="lg" />

        {/* Navigation back to register */}
        <View style={styles.footer}>
          <Text variant="bodySmall" color="rgba(255, 255, 255, 0.6)">
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text variant="bodySmall" weight="bold" color="#FF4B2B">
              Sign Up
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
    opacity: 0.15,
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
    opacity: 0.1,
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
