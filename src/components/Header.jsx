'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  const icon = theme === 'dark' ? <Sun size={20} /> : theme === 'light' ? <Moon size={20} /> : <Monitor size={20} />;

  return (
    <header className="py-6 px-4 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-medium">Jordi Poblet</h1>
        <p className="text-foreground-secondary">Product Designer</p>
      </div>
    </header>
  );
}
