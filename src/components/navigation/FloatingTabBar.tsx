import React from 'react';
import { View, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Flame,
  Users,
  Trophy,
  Award,
  User,
} from 'lucide-react-native';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { animations } from '../../design-system/tokens/animations';
import { radius } from '../../design-system/tokens/radius';
import { GlassCard } from '../../design-system/primitives/GlassCard';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 32; // 16 margin on left/right

export interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  
  // Calculate active sliding pill index
  const tabWidth = TAB_BAR_WIDTH / state.routes.length;
  const translateX = useSharedValue(state.index * tabWidth);

  React.useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, animations.spring.snappy);
  }, [state.index, tabWidth]);

  const activePillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const getIcon = (routeName: string, isFocused: boolean) => {
    const size = 22;
    const color = isFocused ? colors.surface : colors.textSecondary;

    switch (routeName) {
      case 'index':
        return <Flame size={size} color={isFocused ? '#FF4B2B' : colors.textSecondary} fill={isFocused ? '#FF4B2B' : 'transparent'} />;
      case 'feed':
        return <Users size={size} color={color} />;
      case 'leaderboard':
        return <Trophy size={size} color={color} />;
      case 'squads':
        return <Award size={size} color={color} />;
      case 'profile':
        return <User size={size} color={color} />;
      default:
        return <Flame size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <GlassCard borderRadius="2xl" intensity="high" style={styles.tabBar}>
        {/* Animated active pill background */}
        <Animated.View
          style={[
            styles.activePill,
            {
              width: tabWidth - 12,
              backgroundColor: isDark ? 'rgba(255, 75, 43, 0.15)' : 'rgba(255, 75, 43, 0.1)',
              borderColor: 'rgba(255, 75, 43, 0.3)',
              left: 6,
            },
            activePillStyle,
          ]}
        />

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

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
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.iconContainer}>
                {getIcon(route.name, isFocused)}
              </View>
            </Pressable>
          );
        })}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 16,
    right: 16,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  tabBar: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
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
    height: 44,
    width: 44,
    borderRadius: radius.md,
  },
  activePill: {
    position: 'absolute',
    height: 48,
    borderRadius: radius.xl,
    borderWidth: 1,
    zIndex: -1,
  },
});
