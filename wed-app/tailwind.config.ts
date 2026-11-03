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
          secondary: '#C5A059',  // metallic champagne gold (matching logo)
          accent: '#FDF0F5',     // blush pink background
          dark: '#1A0A10',       // near-black
          gold: {
            light: '#E6D3B3',
            DEFAULT: '#C5A059',
            dark: '#A6823E',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        cinzel: ["'Cinzel'", 'serif'],
        playfair: ["'Playfair Display'", 'serif'],
        script: ["'Great Vibes'", "'Pinyon Script'", 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
