#!/bin/bash

# 显示彩色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
PULL_CODE=true
REBUILD_IMAGES=false
ENV="production"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-pull)
      PULL_CODE=false
      shift
      ;;
    --rebuild)
      REBUILD_IMAGES=true
      shift
      ;;
    --env)
      ENV="$2"
      shift 2
      ;;
    --help)
      echo "用法: $0 [选项]"
      echo "选项:"
      echo "  --no-pull        不拉取最新代码"
      echo "  --rebuild        重新构建Docker镜像"
      echo "  --env ENV        指定环境 (production, test, dev)"
      echo "  --help           显示帮助信息"
      exit 0
      ;;
    *)
      echo "${RED}未知参数: $1${NC}"
      exit 1
      ;;
  esac
done

echo "${YELLOW}========== 博客系统部署脚本 (${ENV}环境) ==========${NC}"

# 拉取最新代码
if [ "$PULL_CODE" = true ]; then
  echo "${BLUE}拉取最新代码...${NC}"
  git fetch --all
  git reset --hard origin/main
  echo "${GREEN}✓ 代码已更新${NC}"
fi

# 检查环境文件
ENV_FILE="packages/blog-nest/.env.${ENV}"
if [ ! -f "$ENV_FILE" ]; then
  echo "${RED}错误: 缺少环境配置文件 ${ENV_FILE}${NC}"
  echo "${YELLOW}请先创建该文件，参考 deploy.md 中的说明${NC}"
  exit 1
fi

# 创建并检查必要的目录和配置文件
echo "${BLUE}检查并创建必要的目录和配置...${NC}"

# 确保配置目录存在
mkdir -p mysql/conf
if [ ! -f "mysql/conf/my.cnf" ]; then
  echo "${YELLOW}创建 MySQL 配置文件...${NC}"
  cat > mysql/conf/my.cnf << EOF
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default-time-zone='+8:00'
max_connections=200
default_authentication_plugin=mysql_native_password

[client]
default-character-set=utf8mb4
EOF
fi

# 确保其他必要目录存在
mkdir -p logs/nginx
mkdir -p nginx

echo "${GREEN}✓ 目录和配置文件已准备完成${NC}"

# 复制正确的环境变量文件
echo "${BLUE}设置环境变量...${NC}"
cp "$ENV_FILE" packages/blog-nest/.env
echo "${GREEN}✓ 环境变量已设置${NC}"

# 选择合适的docker-compose文件
if [ "$ENV" = "production" ]; then
  COMPOSE_FILE="docker-compose.yml"
else
  COMPOSE_FILE="docker-compose.local.yml"
fi

# 构建和启动服务
echo "${BLUE}开始构建和启动服务...${NC}"

if [ "$REBUILD_IMAGES" = true ]; then
  echo "${YELLOW}正在重新构建所有镜像...${NC}"
  docker compose -f $COMPOSE_FILE build --no-cache
  echo "${GREEN}✓ 镜像构建完成${NC}"
  docker compose -f $COMPOSE_FILE up -d --force-recreate
else
  docker compose -f $COMPOSE_FILE up -d --build
fi

echo "${GREEN}✓ 服务已成功启动${NC}"

# 显示服务状态
echo "${BLUE}检查服务状态...${NC}"
docker compose -f $COMPOSE_FILE ps
echo ""

# 清理未使用的镜像和容器
echo "${BLUE}清理未使用的Docker资源...${NC}"
docker system prune -f
echo "${GREEN}✓ 清理完成${NC}"

# 显示访问信息
echo ""
echo "${GREEN}===================================================${NC}"
echo "${GREEN}服务已启动，可以通过以下地址访问:${NC}"
echo " - 后端API: http://localhost:3000"
echo " - 管理后台: http://localhost:8080 或 http://localhost/admin/"
echo " - 前台博客: http://localhost:3333 或 http://localhost/"
echo ""
echo "${YELLOW}使用以下命令查看应用日志:${NC}"
echo "docker compose -f $COMPOSE_FILE logs -f"
echo ""
echo "${BLUE}快速诊断:${NC}"
echo "检查容器: docker compose -f $COMPOSE_FILE ps"
echo "检查网络: docker network inspect blog-network"
echo "检查数据库: docker compose -f $COMPOSE_FILE exec mysql mysql -u root -p"
echo "${GREEN}===================================================${NC}"