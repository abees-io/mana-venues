import type { Config } from 'tailwindcss'

const candyScale = {
  50: '#FFFFFF',
  100: '#FAFDFD',
  200: '#F5FBFA',
  300: '#EBF7F5',
  400: '#E2F4F2',
  500: '#D5EFEB',
  600: '#C7EAE5',
  700: '#B8E4DD',
  800: '#F0F9F8',  // Core Candy Floss
  900: '#D8F0EC',
  950: '#BBE6DF',
}

const roseScale = {
  50: '#FFF0F5',   // Very soft pink (LavenderBlush)
  100: '#FCE7ED',
  200: '#FAD0DD',
  300: '#F6A8C1',
  400: '#EE759F',
  500: '#E05A85',  // Core Vibrant Rose
  600: '#C83B68',  // Rich Rose
  700: '#A42A51',  // Deep Rose
  800: '#7E1F3E',  // Royal Rose
  900: '#5A172D',  // Wine Rose
  950: '#3D0E1E',  // Darkest Plum Rose
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Swap green & emerald globally to Candy Floss
        green: candyScale,
        emerald: candyScale,
        sky: roseScale,
        blue: roseScale,
        yellow: roseScale,
        amber: roseScale,
        brand: {
          primary: '#C83B68',    // Rich Rose
          secondary: '#E05A85',  // Vibrant Rose
          accent: '#F0F9F8',     // Candy Floss
          dark: '#3D0E1E',       // Dark Wine Plum Rose
          candy: '#F0F9F8',      // Candy Floss
          rose: '#C83B68',       // Rose
          softPink: '#FFF0F5',   // Lighter soft pink
          lightPink: '#FFF2F6',  // Lighter soft pink
          bubblegum: '#E05A85',  // Rose
          gold: {
            light: '#FAD0DD',
            DEFAULT: '#E05A85',  // Rose
            dark: '#7E1F3E',
          },
          rush: {
            light: '#FCE7ED',
            DEFAULT: '#E05A85',
            dark: '#A42A51',
          },
          forest: {
            light: '#F0F9F8',
            DEFAULT: '#D8F0EC',
            dark: '#BBE6DF',
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
