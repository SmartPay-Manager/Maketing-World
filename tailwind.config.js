/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-purple': {
          900: 'rgb(8, 3, 12)',  // Darker main background
          800: 'rgb(16, 6, 23)', // Previous 900
          700: 'rgb(25, 9, 35)', // Darker container background
          600: 'rgb(38, 14, 53)', // Previous 800
          500: 'rgb(59, 22, 84)'  // Previous 700
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
