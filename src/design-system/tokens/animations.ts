import { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export const animations = {
  spring: {
    bouncy: {
      damping: 10,
      mass: 0.8,
      stiffness: 100,
    } as WithSpringConfig,
    gentle: {
      damping: 15,
      mass: 1,
      stiffness: 80,
    } as WithSpringConfig,
    snappy: {
      damping: 12,
      mass: 0.5,
      stiffness: 150,
    } as WithSpringConfig,
    slow: {
      damping: 20,
      mass: 1.2,
      stiffness: 60,
    } as WithSpringConfig,
  },
  timing: {
    fast: {
      duration: 150,
    } as WithTimingConfig,
    normal: {
      duration: 300,
    } as WithTimingConfig,
    slow: {
      duration: 500,
    } as WithTimingConfig,
  }
};
export type AnimationPreset = keyof typeof animations.spring | keyof typeof animations.timing;
