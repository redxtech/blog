/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {}
  },
  content: [
    './index.md',
    './.vitepress/theme/**/*.{vue,js,ts,jsx,tsx}',
    './posts/**/*.md'
  ],
  plugins: [require('@tailwindcss/typography')]
}
