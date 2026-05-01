/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1e2a3a',
          900: '#151f2e',
        }
      }
    },
  },
  plugins: [],
}