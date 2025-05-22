module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'prettier',
  ],
  plugins: [],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
  },
  globals: {
    // 添加 Nuxt 自动导入的全局变量
    useRoute: 'readonly',
    useRouter: 'readonly',
    useAppStore: 'readonly',
    useBlogStore: 'readonly',
    useUserStore: 'readonly',
    definePageMeta: 'readonly',
    // Vue Composition API
    ref: 'readonly',
    computed: 'readonly',
    reactive: 'readonly',
    onMounted: 'readonly',
    watch: 'readonly',
  },
} 