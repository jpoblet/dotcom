// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'foreground': 'var(--color-foreground)',
        'foreground-secondary': 'var(--color-foreground-secondary)',
        'background': 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        'accent': 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  darkMode: 'class', // Needed for dark mode via class
};
