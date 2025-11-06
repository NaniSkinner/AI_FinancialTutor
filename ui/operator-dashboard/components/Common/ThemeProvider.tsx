"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Store theme in localStorage as backup
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // On initial mount, check localStorage and apply theme immediately
  useEffect(() => {
    const storedTheme = localStorage.getItem("spendsense-theme");
    if (storedTheme) {
      try {
        const themeData = JSON.parse(storedTheme);
        const initialTheme = themeData.state?.theme || "light";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(initialTheme);
      } catch (e) {
        console.error("Failed to parse theme from localStorage", e);
      }
    }
  }, []);

  return <>{children}</>;
}
