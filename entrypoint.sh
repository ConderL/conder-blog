#!/bin/sh
echo "等待数据库准备就绪..."
while ! nc -z $DB_HOST $DB_PORT; do
  echo "等待 MySQL TCP 连接..."
  sleep 2
done

echo "MySQL TCP 连接成功!"

echo "开始执行数据库迁移..."
if [ "$SKIP_MIGRATIONS" = "true" ]; then
  echo "SKIP_MIGRATIONS=true，跳过数据库迁移"
else
  npx typeorm migration:run -d ./dist/data-source.js || echo "迁移可能失败，但继续启动"
fi

if [ "$RUN_MIGRATIONS_ONLY" = "true" ]; then
  echo "RUN_MIGRATIONS_ONLY=true，迁移完成后退出"
  exit 0
fi

echo "使用 node 直接启动应用..."
exec node dist/main.js
