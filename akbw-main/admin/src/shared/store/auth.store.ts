import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccessItem {
  id: number;
  name: string;
}

interface AuthState {
  adminToken: string | null;
  refreshToken: string | null;
  adminAccess: AccessItem[];
  setAdminToken: (token: string | null, refreshToken?: string | null, access?: AccessItem[], shouldRedirect?: boolean) => void;
  setAdminAccess: (access: AccessItem[]) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      adminToken: null,
      refreshToken: null,
      adminAccess: [],
      setAdminToken: (token: string | null, refreshToken?: string | null, access?: AccessItem[], shouldRedirect: boolean = true) => {
        set({ adminToken: token, refreshToken: refreshToken || null, adminAccess: access || [] });
        if (token && shouldRedirect) {
          window.location.replace("/");
        }
      },
      setAdminAccess: (access: AccessItem[]) => {
        set({ adminAccess: access });
      },
      logout: () => {
        set({ adminToken: null, refreshToken: null, adminAccess: [] });
        window.location.replace('/login');
      },
    }),
    {
      name: 'admin-auth-storage',
    },
  ),
);

export const hasAccess = (adminAccess: AccessItem[], permission: string): boolean => {
  return adminAccess.some((a) => a.name === permission);
};
