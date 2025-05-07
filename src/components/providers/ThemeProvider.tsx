
'use client';

import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

// Allow any string as a theme name now
export type Theme = string;

// Keep known themes for potential logic, but type is string
const knownThemes: string[] = ['light', 'dark', 'blue', 'christmas', 'halloween', 'christmas-dark'];

interface ThemeContextProps {
  theme: Theme | null; // Allow null initial state
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Helper function to get the initial theme safely on the client
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'; // Default for server-side rendering
  }
  const storedTheme = localStorage.getItem('theme') as Theme | null;
  // Basic check if storedTheme is a non-empty string
  if (storedTheme) {
    return storedTheme;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = prefersDark ? 'dark' : 'light';
  return initialTheme;
};

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme | null>(null); // Start with null
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Set initial theme only after mount
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    localStorage.setItem('theme', initialTheme); // Set localStorage here
  }, []);

  // Effect to apply theme class and save to localStorage whenever theme changes
  useEffect(() => {
    if (!isMounted || theme === null) return; // Don't run on server or before theme is initialized

    // Remove known theme classes first to avoid conflicts
    // If themes are added dynamically, this list might need updating or a different approach
    document.documentElement.classList.remove('dark', ...knownThemes.filter(t => t !== 'light' && t !== 'dark').map(t => `theme-${t}`));

    // Apply the active theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme !== 'light') {
      // Apply theme- prefix for custom themes
      document.documentElement.classList.add(`theme-${theme}`);
    }
    // 'light' is the default (no specific class needed)

    // Save the active theme to localStorage
    localStorage.setItem('theme', theme);

  }, [theme, isMounted]); // Re-run this effect ONLY when theme or isMounted changes

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Provide null theme until mounted to prevent hydration issues
  const contextValue = {
    theme: isMounted ? theme : null,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  // The context value will have theme: null until mounted, components using
  // useTheme should handle this (e.g., return null or loading state).
  return context as ThemeContextProps; // Cast as non-undefined after check
};

export default ThemeProvider;
