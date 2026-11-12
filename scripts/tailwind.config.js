/**
 * scripts/tailwind.config.js
 * Konfigurasi Tailwind kanonik untuk WebApp.html (FASE 2 P1).
 * Sumber asli: blok `tailwind.config = {...}` di WebApp.html saat masih
 * memakai Play CDN; kini WebApp.html memakai CSS kompilasi inline, dan
 * file inilah yang dibaca `npm run css:build` (scripts/build-tailwind.js).
 */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f4f7f5',
          100: '#e8f0ec',
          200: '#d1e0d8',
          500: '#40916c',
          700: '#2d6a4f',
          800: '#1b4332',
          900: '#081c15',
        },
        surface: '#fcfbf7',
        ink: '#1c1e21',
        muted: '#656b73',
        borderline: '#e1e5ea'
      }
    }
  }
};
