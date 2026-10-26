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
          navy: '#1A237E',
          secondary: '#283593',
          action: '#2563EB',
          teal: '#0F766E',
          bg: '#F5F7FA',
          card: '#FFFFFF',
          text: '#172033',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        status: {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#D97706',
          low: '#15803D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
