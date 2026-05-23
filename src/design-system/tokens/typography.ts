import { Platform } from 'react-native';

export const typography = {
  fonts: {
    display: Platform.select({
      ios: 'Inter-Black',
      android: 'Inter-Black',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'Inter-Medium',
      android: 'Inter-Medium',
      default: 'System',
    }),
    regular: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'Inter-Light',
      android: 'Inter-Light',
      default: 'System',
    }),
  },
  sizes: {
    hero: 36,
    h1: 28,
    h2: 22,
    h3: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    micro: 10,
    label: 12,
  },
  lineHeights: {
    hero: 44,
    h1: 34,
    h2: 28,
    h3: 24,
    body: 22,
    bodySmall: 18,
    caption: 16,
    micro: 12,
    label: 14,
  },
  letterSpacings: {
    hero: -0.5,
    h1: -0.3,
    h2: -0.2,
    h3: -0.1,
    body: 0,
    bodySmall: 0,
    caption: 0.1,
    micro: 0.2,
    label: 1.2, // Tracking for uppercase labels
  }
};
