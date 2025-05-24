/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './app.config.ts',
    './nuxt.config.ts',
    './node_modules/@nuxt/ui/dist/**/*.{js,vue,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Tailwind CSS 4 配置
  darkMode: ['class', '[data-mode="dark"]'],
  future: {
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
  },
} 