import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';

interface StreakFlameProps {
  streak: number;
  size?: number;
}

export default function StreakFlame({ streak, size = 32 }: StreakFlameProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    // Continuous flame breathing pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800 }),
        withTiming(1.0, { duration: 800 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 800 }),
        withTiming(0.6, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * 1.3 }],
  }));

  if (streak === 0) return null;

  return (
    <View className="flex-row items-center bg-darkCard/80 border border-white/10 px-3 py-1.5 rounded-full shadow-lg shadow-primaryOrange/10">
      <View className="relative justify-center items-center mr-1.5">
        {/* Glowing Orange Flame Shadow */}
        <Animated.View
          style={[styles.glow, animatedGlowStyle]}
          className="absolute w-6 h-6 rounded-full bg-primaryOrange"
        />
        {/* Pulsing Flame Icon */}
        <Animated.View style={animatedFlameStyle}>
          <Flame color="#FF4B2B" fill="#FF4B2B" size={size} />
        </Animated.View>
      </View>
      <Text className="text-white text-lg font-black tracking-tighter">
        {streak} 🔥
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    shadowColor: '#FF4B2B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});
