/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5faff',
          100: '#e0f2ff',
          200: '#b9e0ff',
          300: '#7cc4fa',
          400: '#38a1f7',
          500: '#0077e6',
          600: '#005bb5',
          700: '#003f7f',
          800: '#00264d',
          900: '#001326',
        },
      },
    },
  },
  plugins: [],
}