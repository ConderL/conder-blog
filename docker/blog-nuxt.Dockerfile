# 构建阶段
FROM node:19.6.1-alpine AS builder

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV VITE_BASE_URL=/
ENV VITE_SERVICE_BASE_URL=https://api.conder.top

# 安装 pnpm
RUN npm install -g pnpm

# 设置 pnpm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制 Monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装项目依赖
RUN pnpm install --prod=false --shamefully-hoist

# 复制子项目代码
COPY packages/blog-nuxt ./packages/blog-nuxt

# 安装子项目依赖并构建
RUN cd packages/blog-nuxt && \
    pnpm install --prod=false && \
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