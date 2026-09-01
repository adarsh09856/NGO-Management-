/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        monastery: {
          sidebar: '#090D16',
          maroon: '#0F172A',
          wine: '#1E293B',
          crimson: '#E11D48',
          ruby: '#BE123C',
          gold: '#F59E0B',
          'gold-light': '#FEF3C7',
          'gold-dark': '#D97706',
          cream: '#F8FAFC',
          sand: '#F1F5F9',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        tibetan: ['"Noto Sans Tibetan"', 'Jomolhari', 'sans-serif']
      }
    },
  },
  plugins: [],
};
