/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        oled: '#000000',
        darkCard: '#080c12',
        darkCardHover: '#0f1622',
        darkBorder: '#14202e',
        ice: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          DEFAULT: '#06b6d4',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        zenTeal: {
          DEFAULT: '#0d9488',
          light: '#14b8a6',
          dark: '#115e59',
          glow: 'rgba(13, 148, 136, 0.25)'
        },
        amber: {
          neon: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.25)',
          deep: '#d97706'
        }
      },
      boxShadow: {
        'ice-glow': '0 0 25px rgba(34, 211, 238, 0.35)',
        'ice-glow-lg': '0 0 45px rgba(34, 211, 238, 0.5)',
        'teal-glow': '0 0 25px rgba(20, 184, 166, 0.35)',
        'amber-glow': '0 0 35px rgba(245, 158, 11, 0.45)',
        'card-glow': '0 10px 40px -10px rgba(0, 0, 0, 0.7)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.82', transform: 'scale(1.02)' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
