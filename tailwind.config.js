/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#0f172a',
        'secondary': '#1e293b',
        'accent': '#38bdf8',
        'highlight': '#334155',
        'success': '#22c55e',
        'warning': '#f59e0b',
        'danger': '#ef4444',
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',

        // Light theme colors
        'light-primary': '#f8fafc',
        'light-secondary': '#ffffff',
        'light-highlight': '#e2e8f0',
        'light-text-primary': '#0f172a',
        'light-text-secondary': '#475569',
      }
    }
  },
  plugins: [],
}
