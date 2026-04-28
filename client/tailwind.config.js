/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#6c63ff', light: '#8b85ff', dark: '#4f46e5' },
        accent:  { DEFAULT: '#22d3ee', light: '#67e8f9' },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6c63ff 0%, #22d3ee 100%)',
        'gradient-dark':    'linear-gradient(135deg, #0d0f1a 0%, #111827 100%)',
      },
    },
  },
  plugins: [],
}
