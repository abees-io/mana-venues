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
          secondary: '#D8A629',  // rich metallic royal gold (from brand asset)
          accent: '#F0F7F2',     // light forest tint
          dark: '#0B1F12',       // darkest forest
          gold: {
            light: '#E0B12D',
            DEFAULT: '#D8A629',
            dark: '#C8901F',
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
        cormorant: ["'Cormorant Garamond'", 'serif'],
        outfit: ["'Outfit'", 'sans-serif'],
        jakarta: ["'Plus Jakarta Sans'", 'sans-serif'],
        syne: ["'Syne'", 'sans-serif'],
        urbanist: ["'Urbanist'", 'sans-serif'],
        archivo: ["'Archivo'", 'sans-serif'],
        oswald: ["'Oswald'", 'sans-serif'],
        bebas: ["'Bebas Neue'", 'sans-serif'],
        spaceGrotesk: ["'Space Grotesk'", 'sans-serif'],
        script: ["'Great Vibes'", "'Pinyon Script'", 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
