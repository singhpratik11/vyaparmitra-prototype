/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#123B78',
          blue: '#1265A8',
          teal: '#10B8A5',
          mint: '#E8F7F3',
          dark: '#172033',
          secondary: '#526174',
          bg: '#F6F9FB',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        formal: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(18, 59, 120, 0.04), 0 1px 2px 0 rgba(18, 59, 120, 0.02)',
        'card': '0 2px 8px -1px rgba(18, 59, 120, 0.06), 0 1px 4px -1px rgba(18, 59, 120, 0.04)',
        'modal': '0 20px 25px -5px rgba(18, 59, 120, 0.1), 0 10px 10px -5px rgba(18, 59, 120, 0.04)',
      },
      borderRadius: {
        'card': '14px',
      }
    },
  },
  plugins: [],
}
