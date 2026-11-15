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
          secondary: '#FFC700',  // bright rush yellow (vibrant & luminous)
          accent: '#F0F7F2',     // light forest tint
          dark: '#0B1F12',       // darkest forest
          gold: {
            light: '#FFF04B',    // bright rush yellow highlight
            DEFAULT: '#FFC700',  // core bright rush yellow
            dark: '#FFA000',     // deep amber rush
          },
          rush: {
            light: '#FFF566',
            DEFAULT: '#FFCC00',
            dark: '#FFA000',
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
        italiana: ["'Italiana'", 'serif'],
        script: ["'Great Vibes'", "'Pinyon Script'", 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
