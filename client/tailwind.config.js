/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        volleyball: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
          dark: '#6b0d1e',
          deep: '#850e24',
          court: '#b91c1c',
          accent: '#e63946',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'volleyball-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'volleyball-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(-24px) rotate(180deg)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        'shadow-squish': {
          '0%, 100%': { transform: 'scaleX(1.2) scaleY(0.7)', opacity: '0.6' },
          '50%': { transform: 'scaleX(0.7) scaleY(0.5)', opacity: '0.2' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'volleyball-spin': 'volleyball-spin 3s linear infinite',
        'volleyball-bounce': 'volleyball-bounce 1s infinite',
        'shadow-squish': 'shadow-squish 1s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
