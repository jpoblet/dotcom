"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system");

  const apply = (t) => {
    const root = document.documentElement;
    if (
      t === "dark" ||
      (t === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "system";
    setTheme(saved);
    apply(saved);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (saved === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setAndStoreTheme = (newTheme) => {
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
    apply(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setAndStoreTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
