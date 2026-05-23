import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors, ColorTheme, ThemeType } from '../tokens/colors';

type ThemeContextType = {
  theme: ThemeType;
  colors: ColorTheme;
  isDark: boolean;
  setTheme: (theme: ThemeType) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'dayzo_user_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('dark'); // Default to dark premium theme

  useEffect(() => {
    async function loadTheme() {
      try {
        if (Platform.OS !== 'web') {
          const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
          if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'amoled') {
            setThemeState(savedTheme);
          } else if (systemColorScheme) {
            setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
          }
        } else {
          const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
          if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'amoled') {
            setThemeState(savedTheme);
          } else if (systemColorScheme) {
            setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
          }
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    }
    loadTheme();
  }, [systemColorScheme]);

  const setTheme = async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  const activeColors = colors[theme] || colors.dark;
  const isDark = theme === 'dark' || theme === 'amoled';

  return (
    <ThemeContext.Provider value={{ theme, colors: activeColors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
