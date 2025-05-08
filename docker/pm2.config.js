module.exports = {
  apps: [
    {
      name: 'blog-nest',
      script: 'dist/main.js',  // 在Docker容器中，dist目录位于根目录
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // 使用容器的环境变量
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}; 