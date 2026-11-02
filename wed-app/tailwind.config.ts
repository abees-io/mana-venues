import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8B1A4A',    // deep rose/maroon (wedding)
          secondary: '#D4AF37',  // gold
          accent: '#FDF0F5',     // blush pink background
          dark: '#1A0A10',       // near-black
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        cinzel: ["'Cinzel'", 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
