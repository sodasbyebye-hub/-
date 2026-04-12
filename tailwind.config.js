/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-pink': '#FFB7C5',    // 趴趴兔
        'cream-yellow': '#F3E5AB',  // 小胖熊
        'lavender': '#B29DD9',      // 小猫咪
        'sky-blue': '#A7C7E7',      // 小企鹅
        'peach': '#FFDAC1',         // 小粉猪
        'mint': '#B9FBC0',
        'soft-brown': '#5D4037',
        'soft-bg': '#FDF6F0'
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '40px',
      }
    },
  },
  plugins: [],
}
