import { create } from 'zustand';

export type UserRole = 'patient' | 'institution' | 'insurance' | 'doctor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// TODO: Replace with real authentication integration

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    // Placeholder: always fail until wired to backend
    return false;
  },

  register: async (email: string, password: string, name: string, role: UserRole) => {
    // Placeholder: no-op until backend integration
    return false;
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
}));