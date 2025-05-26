# Blog-Nuxt

基于Nuxt.js的博客网站，实现服务端渲染以提高SEO效果。

## 功能特性

- 服务端渲染(SSR)提高SEO效果
- 响应式设计，适配各种设备
- 文章列表和详情页
- 文章评论功能
- 用户登录和注册

## 技术栈

- Nuxt.js 3
- Vue 3
- TypeScript
- UnoCSS
- Pinia

## 开发指南

### 环境要求

- Node.js 16+
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
cd packages/blog-nuxt
npm install
# 或者使用 yarn/pnpm
# yarn install
# pnpm install
```

### 开发模式

```bash
npm run dev
# 或者
# yarn dev
# pnpm dev
```

### 构建项目

```bash
npm run build
# 或者
# yarn build
# pnpm build
```

### 启动预览

```bash
npm run preview
# 或者
# yarn preview
# pnpm preview
```

## 项目结构

```
blog-nuxt/
├── assets/           # 静态资源
├── components/       # 组件
├── composables/      # 组合式函数
├── layouts/          # 布局
├── pages/            # 页面
├── plugins/          # 插件
├── public/           # 公共文件
├── server/           # 服务端
├── utils/            # 工具函数
├── app.vue           # 应用入口
├── nuxt.config.ts    # Nuxt配置
└── tsconfig.json     # TypeScript配置
```

## 部署

1. 执行构建命令生成dist目录：
```bash
npm run build
```

2. 启动Node.js服务器：
```bash
node .output/server/index.mjs
```

## 许可证

MIT 