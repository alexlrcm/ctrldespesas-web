import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF9800', // Laranja principal
          dark: '#F57C00',
          light: '#FFB74D',
        },
        success: '#4CAF50',
        error: '#D32F2F',
        warning: '#FF9800',
        info: '#2196F3',
        custom: {
          gray: '#DEDEDE', // RGB(222,222,222)
          green: '#005A5A', // RGB(0,90,90)
        },
      },
    },
  },
  plugins: [],
}
export default config
