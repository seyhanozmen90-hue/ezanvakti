import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Logo renklerine göre güncellendi: Lacivert/Navy + Altın/Gold
        primary: {
          50: '#f5f7fa',   // Çok açık mavi-gri
          100: '#e8ecf2',  // Açık mavi-gri
          200: '#d1dae6',  // Orta açık mavi-gri
          300: '#a8b8d1',  // Orta mavi
          400: '#7a91b8',  // Orta koyu mavi
          500: '#3d4e6e',  // Ana lacivert (logodaki lacivert)
          600: '#2f3d5a',  // Koyu lacivert
          700: '#252f47',  // Daha koyu lacivert
          800: '#1d2433',  // Çok koyu lacivert
          900: '#141a26',  // En koyu lacivert (arka plan)
        },
        gold: {
          50: '#fffbeb',   // Çok açık altın
          100: '#fef3c7',  // Açık altın
          200: '#fde68a',  // Orta açık altın
          300: '#fcd34d',  // Orta altın
          400: '#fbbf24',  // Parlak altın
          500: '#f59e0b',  // Ana altın (logodaki altın)
          600: '#d97706',  // Koyu altın
          700: '#b45309',  // Daha koyu altın
          800: '#92400e',  // Çok koyu altın
          900: '#78350f',  // En koyu altın
        },
        navy: {
          DEFAULT: '#3d4e6e',
          dark: '#2f3d5a',
          darker: '#252f47',
          darkest: '#141a26',
        },
      },
    },
  },
  plugins: [],
}
export default config
