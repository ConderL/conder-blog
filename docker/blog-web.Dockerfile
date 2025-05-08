# 构建阶段
FROM node:19.6.1-alpine AS builder

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV VITE_BASE_URL=/
ENV VITE_SERVICE_BASE_URL=http://api.conder.top
ENV VITE_ICON_PREFIX=icon
ENV VITE_ICON_LOCAL_PREFIX=icon-local
ENV VITE_DIST_NAME=dist
ENV VITE_HTTP_PROXY=Y
ENV VITE_VISUALIZER=Y
ENV VITE_COMPRESS=Y
ENV VITE_COMPRESS_TYPE=gzip

# 安装 pnpm
RUN npm install -g pnpm

# 设置 pnpm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制 Monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装项目依赖
RUN pnpm install --prod=false --shamefully-hoist

# 复制子项目代码
COPY packages/blog-web ./packages/blog-web


# 安装子项目依赖并构建
RUN cd packages/blog-web && \
    pnpm install --prod=false && \
    pnpm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/packages/blog-web/dist /usr/share/nginx/html

# nginx配置
RUN rm -f /etc/nginx/conf.d/*.conf && rm -f /etc/nginx/nginx.conf
COPY nginx/web.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]