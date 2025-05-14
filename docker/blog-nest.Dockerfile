# 基础阶段 - 仅安装依赖
FROM node:19.6.1 AS deps
WORKDIR /app

# 仅复制 package.json 相关文件
COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
COPY packages/blog-nest/package.json ./packages/blog-nest/

# 安装依赖
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --shamefully-hoist

# 构建阶段
FROM node:19.6.1 AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/blog-nest/node_modules ./packages/blog-nest/node_modules

# 复制源代码
COPY . .

# 构建应用
RUN npm install -g pnpm && \
    cd packages/blog-nest && \
    pnpm run build

# 生产阶段
FROM node:19.6.1 AS runner
WORKDIR /app

# 安装生产依赖
RUN apt-get update && \
    apt-get install -y netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/packages/blog-nest/dist ./dist
COPY --from=builder /app/packages/blog-nest/migrations ./migrations
COPY --from=builder /app/packages/blog-nest/package*.json ./

# 指定使用生产环境配置
ENV NODE_ENV=production

# 安装依赖
RUN npm install --legacy-peer-deps --build-from-source

# 添加入口脚本
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh && \
    sed -i '1i #!/bin/sh' ./entrypoint.sh

# Nginx配置
RUN rm -f /etc/nginx/conf.d/*.conf && rm -f /etc/nginx/nginx.conf
COPY nginx/nest.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# 入口点
ENTRYPOINT ["./entrypoint.sh"] 