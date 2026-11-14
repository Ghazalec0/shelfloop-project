"use client";
import { create } from "zustand";

type User = any;
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

function getStored(key: string, fallbackKey?: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key) || (fallbackKey ? localStorage.getItem(fallbackKey) : null);
}

export const useAuth = create<AuthState>((set) => ({
  user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null,
  token: getStored("accessToken", "access_token"),
  refreshToken: getStored("refreshToken", "refresh_token"),
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("access_token", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, refreshToken: refreshToken || null });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    set({ user: null, token: null, refreshToken: null });
  },
}));
