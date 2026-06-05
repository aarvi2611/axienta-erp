"use client";
import React, { createContext, useContext } from "react";

// Axenta Brand Colors
export const theme = {
  colors: {
    primary: "#0F2557",       // Dark Blue
    primaryLight: "#1A3A7A",
    primaryDark: "#091A3F",
    accent: "#D4A843",        // Gold
    accentLight: "#E8C976",
    accentDark: "#B8912E",
    white: "#FFFFFF",
    background: "#F8FAFC",
    backgroundDark: "#0F172A",
    cardDark: "#1E293B",
    surface: "#FFFFFF",
    surfaceDark: "#1E293B",
    text: "#1E293B",
    textLight: "#64748B",
    textDark: "#E2E8F0",
    border: "#E2E8F0",
    borderDark: "#334155",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  gradients: {
    primary: "linear-gradient(135deg, #0F2557 0%, #1A3A7A 100%)",
    gold: "linear-gradient(135deg, #D4A843 0%, #E8C976 100%)",
    hero: "linear-gradient(135deg, #0F2557 0%, #1A3A7A 50%, #0F2557 100%)",
  },
};

const ThemeContext = createContext(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
