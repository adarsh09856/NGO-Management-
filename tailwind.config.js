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
          maroon: '#4A0E17',
          wine: '#721C24',
          crimson: '#BE123C',
          ruby: '#881337',
          gold: '#D4AF37',
          'gold-light': '#FDE68A',
          'gold-dark': '#B45309',
          amber: '#F59E0B',
          cream: '#FAF8F5',
          sand: '#F5EFEB',
          parchment: '#FCFBF9',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        tibetan: ['"Noto Sans Tibetan"', 'Jomolhari', 'sans-serif']
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
        'maroon-glow': '0 0 30px rgba(114, 28, 36, 0.3)',
        'elevated': '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
