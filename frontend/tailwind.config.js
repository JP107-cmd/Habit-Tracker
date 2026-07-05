/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          200: "#F5E5B0",
          300: "#F0D584",
          400: "#E3C567",
          500: "#D4AF37",
          600: "#B8941F",
          700: "#8C6F17",
        },
      },
    },
  },
  plugins: [],
}

