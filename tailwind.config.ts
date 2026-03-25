import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a1a8c',
          mid:     '#2828b0',
          light:   '#3a3acc',
          dark:    '#0f0f5a',
        },
        gold: {
          DEFAULT: '#f09000',
          light:   '#ffcc00',
          dark:    '#c06000',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
