FROM node:18-alpine AS builder

WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./
# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 使用更轻量的镜像
FROM node:18-alpine AS production

# 创建app目录
WORKDIR /app

# 从构建阶段复制node_modules和构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# 复制配置文件和必要的资源
COPY package.json ./
COPY .env.example ./.env

# 暴露3000端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main"] 