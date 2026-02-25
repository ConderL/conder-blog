# 构建阶段
FROM node:18.19.1-alpine AS builder

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV VITE_SERVICE_BASE_URL=https://api.conder.top
ENV VITE_APP_TITLE=博客管理系统

# 安装 pnpm
RUN npm install -g pnpm@8.15.4

# 设置 pnpm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制 Monorepo 配置文件和子项目清单（用于命中依赖缓存）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/blog-admin/package.json ./packages/blog-admin/

# 安装项目依赖
RUN pnpm install --frozen-lockfile --prod=false --shamefully-hoist

# 复制子项目代码
COPY packages/blog-admin ./packages/blog-admin

# 直接使用 workspace 依赖构建，避免再次 install 漂移依赖版本
RUN pnpm --filter blog-admin build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/packages/blog-admin/dist /usr/share/nginx/html

# Nginx配置
RUN rm -f /etc/nginx/conf.d/*.conf && rm -f /etc/nginx/nginx.conf
COPY nginx/admin.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
