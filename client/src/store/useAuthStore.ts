import { create } from 'zustand';
import { User } from '../types';

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (payload: { user: User; token: string }) => void;
  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('harate_token'),
  setAuth: ({ user, token }) => {
    localStorage.setItem('harate_token', token);
    set({ user, token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('harate_token');
    set({ user: null, token: null });
  },
  updateUser: (payload) =>
    set((state) =>
      state.user ? { user: { ...state.user, ...payload } } : { user: null },
    ),
}));

