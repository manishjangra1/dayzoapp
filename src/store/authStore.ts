import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  title: string;
  totalCompletions?: number;
  badges?: Array<{ id: string; title: string; icon: string; description: string }>;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setAuth: async (token, user) => {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    } else {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },
  clearAuth: async () => {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
  updateUser: (userData) => {
    set((state) => {
      if (!state.user) return state;
      const nextUser = { ...state.user, ...userData };
      if (Platform.OS !== 'web') {
        SecureStore.setItemAsync('auth_user', JSON.stringify(nextUser));
      } else {
        localStorage.setItem('auth_user', JSON.stringify(nextUser));
      }
      return { user: nextUser };
    });
  },
  initialize: async () => {
    try {
      let token: string | null = null;
      let userStr: string | null = null;

      if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync('auth_token');
        userStr = await SecureStore.getItemAsync('auth_user');
      } else {
        token = localStorage.getItem('auth_token');
        userStr = localStorage.getItem('auth_user');
      }

      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    }
  },
}));
