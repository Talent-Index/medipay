import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';

export type UserRole = 'patient' | 'institution' | 'insurance' | 'doctor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  address: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (address: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole, address: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// TODO: Replace with real authentication integration

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,

  login: async (address: string) => {
    try {
      if (!address) {
        throw new Error('Wallet address is required for login.');
      }

      const response = await api.auth.login({ address });

      if (response?.success && response.data) {
        const userData = response.data as any;
        
        // Map backend role to frontend role
        const roleMap: Record<string, UserRole> = {
          'PATIENT': 'patient',
          'DOCTOR': 'doctor',
          'INSTITUTION': 'institution',
          'INSURANCE': 'insurance',
        };

        set({
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: roleMap[userData.role] || 'patient',
            avatar: userData.avatar,
            address: userData.address,
          },
          isAuthenticated: true,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (email: string, password: string, name: string, role: UserRole, address: string) => {
    try {
      if (!address) {
        throw new Error('Please connect your wallet before registering.');
      }

      // Map UI role to backend enum casing
      const roleMap: Record<UserRole, 'PATIENT' | 'DOCTOR' | 'INSTITUTION' | 'INSURANCE'> = {
        patient: 'PATIENT',
        doctor: 'DOCTOR',
        institution: 'INSTITUTION',
        insurance: 'INSURANCE',
      };

      const response = await api.auth.register({
        address,
        email,
        name,
        role: roleMap[role],
      });

      if (response?.success && response.data) {
        const createdUser = response.data as any;
        set({
          user: {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            role: role,
            avatar: createdUser.avatar,
            address: createdUser.address,
          },
          isAuthenticated: true,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }
  },
    }),
    {
      name: 'auth-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => {
        // called before rehydration
        return () => {
          // called after rehydration finishes
          useAuthStore.setState({ hydrated: true });
        };
      },
    }
  )
);