import React from 'react';
import { View, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  Flame,
  Users,
  Trophy,
  Award,
  User,
} from 'lucide-react-native';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { animations } from '../../design-system/tokens/animations';
import { radius } from '../../design-system/tokens/radius';
import { GlassCard } from '../../design-system/primitives/GlassCard';

import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabItemProps {
  route: any;
  index: number;
  isFocused: boolean;
  colors: any;
  navigation: any;
}

const TabItem: React.FC<TabItemProps> = React.memo(({
  route,
  index,
  isFocused,
  colors,
  navigation,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    glowOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
  }, [isFocused]);

  const handlePressIn = () => {
    scale.value = withSpring(0.82, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: withSpring(isFocused ? 1.1 : 0.8, { damping: 10, stiffness: 100 }) }],
    };
  });

  const getIcon = () => {
    const size = 20;
    const activeColor = colors.primary;
    const inactiveColor = colors.textSecondary;
    const color = isFocused ? activeColor : inactiveColor;

    switch (route.name) {
      case 'index':
        return <Flame size={size} color={color} fill={isFocused ? activeColor : 'transparent'} />;
      case 'feed':
        return <Users size={size} color={color} fill={isFocused ? `${activeColor}20` : 'transparent'} />;
      case 'leaderboard':
        return <Trophy size={size} color={color} fill={isFocused ? `${activeColor}20` : 'transparent'} />;
      case 'squads':
        return <Award size={size} color={color} fill={isFocused ? `${activeColor}20` : 'transparent'} />;
      case 'profile':
        return <User size={size} color={color} fill={isFocused ? `${activeColor}20` : 'transparent'} />;
      default:
        return <Flame size={size} color={color} />;
    }
  };

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {getIcon()}
        
        {/* Glowing dot below the active icon */}
        <Animated.View
          style={[
            styles.glowingDot,
            { backgroundColor: colors.primary },
            animatedGlowStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
});

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate active sliding pill index
  const tabWidth = (width - 32) / state.routes.length;
  const translateX = useSharedValue(state.index * tabWidth);

  React.useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      damping: 18,
      stiffness: 140,
      mass: 0.8,
    });
  }, [state.index, tabWidth]);

  const activePillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={[styles.container, { height: 76 + insets.bottom }]}>
      {/* Smooth premium fade-out background gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['transparent', 'rgba(8, 8, 12, 0.4)', 'rgba(8, 8, 12, 0.85)', '#08080C']
            : ['transparent', 'rgba(244, 245, 247, 0.4)', 'rgba(244, 245, 247, 0.85)', '#F4F5F7']
        }
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <GlassCard borderRadius="2xl" intensity="high" style={[
        styles.tabBar,
        {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          shadowColor: colors.primary,
          marginBottom: Math.max(insets.bottom - 6, 8),
          marginTop: 6,
        }
      ]}>
        {/* Animated active sliding pill background */}
        <Animated.View
          style={[
            styles.activePill,
            {
              width: tabWidth - 16,
              backgroundColor: isDark ? 'rgba(255, 75, 43, 0.12)' : 'rgba(255, 75, 43, 0.07)',
              borderColor: isDark ? 'rgba(255, 75, 43, 0.35)' : 'rgba(255, 75, 43, 0.2)',
              left: 8,
            },
            activePillStyle,
          ]}
        />

        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              colors={colors}
              navigation={navigation}
            />
          );
        })}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  tabBar: {
    width: width - 32,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 48,
    borderRadius: radius.md,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    height: 50,
    borderRadius: radius.xl,
    borderWidth: 1,
    zIndex: -1,
  },
  glowingDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#FF4B2B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
      },
    }),
  },
});
