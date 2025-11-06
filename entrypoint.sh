#!/bin/sh
echo "等待数据库准备就绪..."
while ! nc -z $DB_HOST $DB_PORT; do
  echo "等待 MySQL TCP 连接..."
  sleep 2
done

echo "MySQL TCP 连接成功!"

echo "开始执行数据库迁移..."
npx typeorm migration:run -d ./dist/data-source.js || echo "迁移可能失败，但继续启动"

echo "使用 node 直接启动应用..."
node dist/main.js