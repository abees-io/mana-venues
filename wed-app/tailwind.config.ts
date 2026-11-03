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
          primary: '#0D2818',    // deep forest green
          secondary: '#FFD700',  // golden rush yellow
          accent: '#F0F7F2',     // light forest tint
          dark: '#0B1F12',       // darkest forest
          gold: {
            light: '#FFF3B0',
            DEFAULT: '#FFD700',
            dark: '#FF9800',
          },
          forest: {
            light: '#1B4332',
            DEFAULT: '#0D2818',
            dark: '#0B1F12',
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
