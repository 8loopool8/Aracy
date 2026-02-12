/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'goth-bg': '#0a0a0c',
        'goth-purple': '#4b006e',
        'goth-gold': '#d4af37',
      },
      // We can add font family here later if needed
    },
  },
  plugins: [],
}