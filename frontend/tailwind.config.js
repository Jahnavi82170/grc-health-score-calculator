/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#0D2137', 50: '#E8EDF2', 100: '#C2D0DC', 200: '#8FAEC4', 300: '#5C8DAD', 400: '#2E6B95', 500: '#1B4F8A', 600: '#163F6E', 700: '#102F53', 800: '#0D2137', 900: '#071220' },
        mint:  { DEFAULT: '#00C896', 50: '#E0FBF4', 400: '#00C896', 500: '#00A87E', 600: '#008862' },
        coral: { DEFAULT: '#FF5757', 400: '#FF5757', 500: '#E03E3E' },
        gold:  { DEFAULT: '#F5A623', 400: '#F5A623', 500: '#D4861A' },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        hover: '0 4px 24px rgba(0,0,0,0.12)',
        glow:  '0 0 32px rgba(0,200,150,0.18)',
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease both',
        'slide-up': 'slideUp 0.4s ease both',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
