/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#0b0f19',
          card: '#131b2e',
          cardHover: '#1c2844',
          accent: '#e50914',
          gold: '#f59e0b',
          neon: '#06b6d4',
          border: '#23304b',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px -3px rgba(229, 9, 20, 0.4)',
        goldGlow: '0 0 20px -3px rgba(245, 158, 11, 0.4)',
      },
    },
  },
  plugins: [],
};
