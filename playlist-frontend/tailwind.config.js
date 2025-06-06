/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',      // Blue
        secondary: '#8B5CF6',    // Purple
        accent: '#F59E0B',       // Amber
        background: '#0F172A',   // Dark blue
        surface: '#1E293B',      // Lighter dark blue
        text: '#F8FAFC',         // Light gray
        textSecondary: '#94A3B8', // Medium gray
        inputBg: '#334155',      // Dark gray
        inputBorder: '#475569',  // Medium gray
        inputText: '#E2E8F0',    // Light gray
        inputPlaceholder: '#64748B' // Gray
      },
      animation: {
        'spin-slow': 'spin 5s linear infinite',
        'wiggle': 'wiggle 1.5s infinite',
        'shake': 'shake 1s infinite',
        'bounce-short': 'bounce-short 1s infinite',
      },
      boxShadow: {
        'crazy': '0 0 20px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}