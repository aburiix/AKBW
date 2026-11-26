import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

const KEY = 'akbw.auth';

// Telefonda tokenlar Keychain'da (SecureStore). Web-preview'da faqat xotirada.
const storage = {
  get: async () => (Platform.OS === 'web' ? null : SecureStore.getItemAsync(KEY)),
  set: async (v: string) => {
    if (Platform.OS !== 'web') await SecureStore.setItemAsync(KEY, v);
  },
  del: async () => {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(KEY);
  },
};

type AuthState = {
  ready: boolean;
  token: string | null;
  refreshToken: string | null;
  hydrate: () => Promise<void>;
  setTokens: (token: string, refreshToken: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  ready: false,
  token: null,
  refreshToken: null,
  hydrate: async () => {
    try {
      const raw = await storage.get();
      if (raw) {
        const { token, refreshToken } = JSON.parse(raw);
        set({ token, refreshToken });
      }
    } catch {
      // buzilgan yozuv — e'tiborsiz
    }
    set({ ready: true });
  },
  setTokens: async (token, refreshToken) => {
    set({ token, refreshToken });
    await storage.set(JSON.stringify({ token, refreshToken }));
  },
  logout: async () => {
    set({ token: null, refreshToken: null });
    await storage.del();
  },
}));
