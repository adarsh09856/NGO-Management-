/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
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
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.45)',
        'maroon-glow': '0 0 30px rgba(114, 28, 36, 0.3)',
        'elevated': '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(212, 175, 55, 0.6))' },
          '50%': { opacity: '0.82', filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.25))' },
        },
        spinSlow: {
          'from%': { transform: 'rotate(0deg)' },
          'to%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-gentle': 'floatGentle 4.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spinSlow 35s linear infinite',
      }
    },
  },
  plugins: [],
};
