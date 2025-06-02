"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor, Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleThemeDropdown = () => {
    setIsThemeDropdownOpen(!isThemeDropdownOpen);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsThemeDropdownOpen(false);
  };

  const getCurrentThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-6 h-6" />;
      case "dark":
        return <Moon className="w-6 h-6" />;
      case "system":
        return <Monitor className="w-6 h-6" />;
      default:
        return <Monitor className="w-6 h-6" />;
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 py-6 px-4 flex items-center justify-end z-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={toggleThemeDropdown}
              className="flex items-center gap-2 px-3 py-2 bg-background-inverse/5 rounded-full hover:bg-background-inverse/15"
              aria-label="Theme selector"
            >
              {getCurrentThemeIcon()}
              <ChevronDown className="w-5 h-5" />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-background rounded-lg shadow-lg border border-background-secondary py-1">
                <button
                  onClick={() => handleThemeChange("light")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">Dark</span>
                </button>
                <button
                  onClick={() => handleThemeChange("system")}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm">System</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </header>

      {/* Fullscreen Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background z-[60] flex flex-col animate-fade-in">
          <div className="py-6 px-4 flex items-center justify-end">
            <button
              onClick={closeMenu}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-12 animate-slide-up">
            <a
              href="/"
              onClick={closeMenu}
              className="text-4xl font-medium text-foreground hover:text-accent transition-colors"
            >
              Home
            </a>
            <a
              href="/bio"
              onClick={closeMenu}
              className="text-4xl font-medium text-foreground hover:text-accent transition-colors"
            >
              Bio
            </a>
            <a
              href="/projects"
              onClick={closeMenu}
              className="text-4xl font-medium text-foreground hover:text-accent transition-colors"
            >
              Projects
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
