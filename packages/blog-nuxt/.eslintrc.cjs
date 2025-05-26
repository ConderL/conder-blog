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
    // 忽略console警告
    'no-console': 'off',
    // 忽略未使用的变量警告
    '@typescript-eslint/no-unused-vars': 'off',
    // 忽略在定义前使用变量的警告
    'no-use-before-define': 'off',
    // 忽略常量重新赋值警告
    'no-const-assign': 'warn',
    // 忽略驼峰命名警告
    'camelcase': 'off',
    // 忽略async函数中没有await表达式的警告
    'require-await': 'off',
    // 忽略不必要的转义字符警告
    'no-useless-escape': 'off',
    // 允许在case块中使用词法声明
    'no-case-declarations': 'off',
    // 忽略模板根元素数量限制
    'vue/no-multiple-template-root': 'off'
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
    $fetch: 'readonly',
    useRuntimeConfig: 'readonly',
    defineNuxtPlugin: 'readonly',
  },
} 