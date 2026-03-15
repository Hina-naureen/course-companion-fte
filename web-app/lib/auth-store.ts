import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "./types";

interface AuthState {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  logout: () => void;
}

// persist middleware stores `user` in localStorage automatically.
// On next page load the user is available instantly — no authApi.me() needed
// for the initial render, eliminating the dashboard loading delay.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (u) => set({ user: u }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          document.cookie = "access_token=; path=/; max-age=0";
        }
        set({ user: null });
      },
    }),
    {
      name:        "auth-user",               // localStorage key
      partialize:  (s) => ({ user: s.user }), // only persist user, not functions
    }
  )
);
