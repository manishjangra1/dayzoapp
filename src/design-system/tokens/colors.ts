export type ColorTheme = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderSubtle: string;
  primary: string;
  primaryHover: string;
  accent: string;
  accentSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
  glow: string;
};

export const lightColors: ColorTheme = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceElevated: '#F3F4F6',
  surfaceHover: '#E5E7EB',
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  primary: '#FF4B2B',
  primaryHover: '#E03E20',
  accent: '#8A2387',
  accentSecondary: '#00F2FE',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  overlay: 'rgba(0, 0, 0, 0.4)',
  glow: 'rgba(255, 75, 43, 0.15)',
};

export const darkColors: ColorTheme = {
  background: '#08080A',
  surface: '#121216',
  surfaceElevated: '#1A1A22',
  surfaceHover: '#24242D',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  border: '#24242D',
  borderSubtle: '#1A1A22',
  primary: '#FF4B2B',
  primaryHover: '#FF6247',
  accent: '#A033A0',
  accentSecondary: '#33F5FF',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  overlay: 'rgba(0, 0, 0, 0.6)',
  glow: 'rgba(255, 75, 43, 0.3)',
};

export const amoledColors: ColorTheme = {
  background: '#000000',
  surface: '#0A0A0C',
  surfaceElevated: '#121214',
  surfaceHover: '#1C1C1F',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  border: '#1C1C1F',
  borderSubtle: '#121214',
  primary: '#FF4B2B',
  primaryHover: '#FF6247',
  accent: '#A033A0',
  accentSecondary: '#33F5FF',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  overlay: 'rgba(0, 0, 0, 0.8)',
  glow: 'rgba(255, 75, 43, 0.4)',
};

export type ThemeType = 'light' | 'dark' | 'auto';

export const colors = {
  light: lightColors,
  dark: darkColors,
  auto: darkColors, // fallback; active colors are resolved dynamically in ThemeProvider based on OS scheme
  // Brand colors
  brand: {
    orange: '#FF4B2B',
    red: '#FF416C',
    purple: '#8A2387',
    pink: '#E94057',
    mint: '#00F2FE',
  }
};
