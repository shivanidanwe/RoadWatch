/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RoadWatch Dark Purple Theme (Section 4)
        brand: {
          bg: '#100B1D',
          sidebar: '#140E22',
          card: '#211735',
          elevated: '#2B2042',
          accent: '#A78BFA',
          accentHover: '#8B5CF6',
          highlight: '#C4B5FD',
          text: '#F5F3FF',
          muted: '#B9AECF',
          border: '#3B2D53',
          critical: '#FB7185',
          high: '#FBBF24',
          medium: '#60A5FA',
          low: '#34D399',
          info: '#60A5FA',
        },
        purple: {
          bg: '#100B1D',
          sidebar: '#140E22',
          card: '#211735',
          elevated: '#2B2042',
          accent: '#A78BFA',
          accentHover: '#8B5CF6',
          text: '#F5F3FF',
          muted: '#B9AECF',
          border: '#3B2D53',
        },
        status: {
          critical: '#FB7185',
          high: '#FBBF24',
          medium: '#60A5FA',
          low: '#34D399',
          info: '#60A5FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
