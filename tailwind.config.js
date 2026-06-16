/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        dream: {
          base:     '#07071a',
          surface:  '#0c0c22',
          elevated: '#0f0f28',
          border:   '#1e1e3a',
          dim:      '#151528',
          purple:   '#6655cc',
          blue:     '#3a7fc1',
          'purple-dark': '#3d2d8a',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}