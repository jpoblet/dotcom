'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');

  const apply = (t) => {
    const root = document.documentElement;
    if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') ?? 'system';
    setTheme(saved);
    apply(saved);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (saved === 'system') apply('system');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setAndStoreTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    apply(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setAndStoreTheme }}>
      {/* Theme toggle buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-white/80 dark:bg-black/30 backdrop-blur-sm p-2 rounded-xl shadow">
        <button
          onClick={() => setAndStoreTheme('light')}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'light' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          aria-label="Light mode"
        >
          <Sun size={18} />
        </button>
        <button
          onClick={() => setAndStoreTheme('dark')}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'dark' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          aria-label="Dark mode"
        >
          <Moon size={18} />
        </button>
        <button
          onClick={() => setAndStoreTheme('system')}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'system' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          aria-label="System mode"
        >
          <Monitor size={18} />
        </button>
      </div>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
