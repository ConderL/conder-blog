# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV VITE_BASE_URL=/
ENV VITE_SERVICE_BASE_URL=https://api.conder.top

# 安装与仓库锁文件匹配的 pnpm 版本
RUN npm install -g pnpm@8.15.4

# 设置 pnpm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 配置pnpm，允许所有构建脚本执行
RUN pnpm config set auto-install-peers true
RUN pnpm config set strict-peer-dependencies false

# 复制 Monorepo 配置文件与子包 package.json（确保按锁文件解析 workspace）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/blog-nuxt/package.json ./packages/blog-nuxt/

# 安装依赖（严格遵循锁文件，避免升级 Nuxt/@nuxt/kit 等版本）
RUN pnpm install --frozen-lockfile --prod=false --shamefully-hoist

# 复制子项目代码
COPY packages/blog-nuxt ./packages/blog-nuxt

# 构建（依赖已在 workspace 级安装）
RUN cd packages/blog-nuxt && \
    pnpm run build

# 生产阶段
FROM nginx:alpine

# 安装Node.js
RUN apk add --no-cache nodejs npm supervisor

# 复制构建产物 - 包括server和public目录
COPY --from=builder /app/packages/blog-nuxt/.output /app/.output

# nginx配置
RUN rm -f /etc/nginx/conf.d/*.conf && rm -f /etc/nginx/nginx.conf
COPY nginx/nuxt.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# 创建supervisor配置
COPY docker/supervisord.conf /etc/supervisord.conf

# 设置环境变量
ENV NODE_ENV=production
ENV NITRO_PORT=4000
ENV NITRO_HOST=0.0.0.0

# 暴露端口
EXPOSE 80

# 使用supervisor同时启动nginx和nuxt服务
CMD ["supervisord", "-c", "/etc/supervisord.conf"] 