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
          sidebar: '#3B0A13',
          maroon: '#4A0E17',
          wine: '#5A121E',
          crimson: '#7E1929',
          gold: '#D4AF37',
          'gold-light': '#FDF6E2',
          'gold-dark': '#B89020',
          cream: '#FDFBF7',
          sand: '#F8F6F0',
          border: '#EBE5D8',
          text: '#2D1810',
          muted: '#6B5E59'
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
