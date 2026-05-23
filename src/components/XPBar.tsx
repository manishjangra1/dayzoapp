import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface XPBarProps {
  xp: number;
  level: number;
}

export default function XPBar({ xp, level }: XPBarProps) {
  const currentProgress = xp % 100;
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(currentProgress, { duration: 800 });
  }, [xp]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View className="w-full mt-4">
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="text-white/60 text-xs font-black uppercase tracking-wider">
          Lvl {level} progress
        </Text>
        <Text className="text-white text-xs font-black">
          {currentProgress}/100 XP
        </Text>
      </View>
      <View className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px]">
        {/* Animated Purple Gradient-Like Progress Bar */}
        <Animated.View
          style={[{
            backgroundColor: '#FF416C',
            shadowColor: '#8A2387',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
          }, animatedStyle]}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}
