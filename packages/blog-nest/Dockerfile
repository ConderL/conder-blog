FROM node:19.6.1

# 启用 pnpm
RUN corepack enable

WORKDIR /app

# 只复制包管理文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖（开发模式）
RUN pnpm install --frozen-lockfile

# 启动命令（实际代码通过 volume 挂载）
CMD ["pnpm", "start:dev"]