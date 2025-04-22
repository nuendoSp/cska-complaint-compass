/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cska-blue': '#1E3A8A',
        'cska-blue-light': '#2563EB',
        'cska-red': '#DC2626',
      },
    },
  },
  plugins: [],
} 