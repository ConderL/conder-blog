# Conder博客系统

这是一个使用Vue3和NestJS构建的全栈博客系统，包含博客前台、管理后台和API服务。

前台访问地址 https://conder.top
后台访问地址 https://admin.conder.top
账密 user 123456


## 项目结构

- `packages/blog-nest` - 后端API服务，基于NestJS开发
- `packages/blog-web` - 博客前台，基于Vue3开发
- `packages/blog-admin` - 管理后台，基于Vue3开发
- `docker/` - Docker相关配置文件
- `.github/workflows/` - GitHub Actions工作流配置
- `nginx/` - Nginx配置文件

## 技术栈

- **前端**：Vue3、Vite、TypeScript
- **后端**：NestJS、TypeScript、MySQL、Redis
- **部署**：Docker、Docker Compose、GitHub Actions
- **数据库**：MySQL 8.0
- **缓存**：Redis 7.0

## 本地开发

### 环境要求

- Node.js v19.6+
- PNPM v8+
- Docker和Docker Compose

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有服务
pnpm dev

# 仅启动后端
pnpm dev:nest

# 仅启动前端和管理后台
pnpm dev:admin
pnpm dev:web
```

## 构建

```bash
pnpm build
```

## 部署

项目支持两种部署方式：GitHub Actions自动部署和本地部署脚本。

### 使用本地部署脚本

项目提供了便捷的本地部署脚本，可以快速在服务器上部署系统：

```bash
./deploy.sh
```

脚本支持以下选项：
```bash
./deploy.sh --no-pull     # 不拉取最新代码
./deploy.sh --rebuild     # 重新构建镜像
./deploy.sh --env test    # 使用测试环境配置
```

### 使用Docker Compose部署

1. 确保安装了Docker和Docker Compose
2. 克隆仓库到服务器
3. 创建`.env`文件，设置必要的环境变量
4. 执行以下命令：

```bash
docker compose up -d
```

### 使用GitHub Actions自动部署

项目配置了GitHub Actions工作流，当推送代码到`main`分支时会自动触发部署。

需要在GitHub仓库设置以下Secrets：

#### 数据库相关
- `DB_USERNAME` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_DATABASE` - 数据库名称
- `MYSQL_ROOT_PASSWORD` - MySQL root密码

#### Redis相关
- `REDIS_PASSWORD` - Redis密码

#### JWT配置
- `JWT_SECRET` - JWT密钥

#### 邮件服务配置
- `MAIL_HOST` - 邮件服务器地址
- `MAIL_PORT` - 邮件服务器端口
- `MAIL_USERNAME` - 邮件服务用户名
- `MAIL_PASSWORD` - 邮件服务密码

#### 第三方登录配置
- `OAUTH_GITHUB_CLIENT_ID` - GitHub OAuth客户端ID
- `OAUTH_GITHUB_CLIENT_SECRET` - GitHub OAuth客户端密钥
- `OAUTH_GITHUB_REDIRECT_URL` - GitHub OAuth回调地址
- `OAUTH_GITEE_CLIENT_ID` - Gitee OAuth客户端ID
- `OAUTH_GITEE_CLIENT_SECRET` - Gitee OAuth客户端密钥
- `OAUTH_GITEE_REDIRECT_URL` - Gitee OAuth回调地址
- `OAUTH_QQ_APP_ID` - QQ登录应用ID
- `OAUTH_QQ_APP_KEY` - QQ登录应用密钥
- `OAUTH_QQ_REDIRECT_URL` - QQ登录回调地址

#### 阿里云OSS配置
- `OSS_ACCESS_KEY_ID` - OSS访问密钥ID
- `OSS_ACCESS_KEY_SECRET` - OSS访问密钥密码
- `OSS_REGION` - OSS区域
- `OSS_BUCKET` - OSS存储桶名称
- `OSS_ENDPOINT` - OSS终端节点
- `OSS_CDN_URL` - OSS CDN地址

#### 搜索配置
- `ELASTICSEARCH_PASSWORD` - Elasticsearch密码

#### 百度文本审核配置
- `BAIDU_API_KEY` - 百度API密钥
- `BAIDU_SECRET_KEY` - 百度密钥

#### 登录鉴权配置
- `RSA_PRIVATE_KEY` - RSA私钥

#### 部署相关
- `DOCKERHUB_USERNAME` - Docker Hub用户名
- `DOCKERHUB_TOKEN` - Docker Hub访问令牌
- `SERVER_HOST` - 部署服务器IP
- `SERVER_USERNAME` - 服务器SSH用户名
- `SERVER_SSH_KEY` - 服务器SSH私钥（确保格式正确且匹配服务器上的公钥）
- `SERVER_DEPLOY_PATH` - 服务器上的部署路径

## 项目架构

系统采用微服务架构，使用Docker容器化部署，使用Nginx作为反向代理：

- **前台博客容器 (blog-web)**: Vue3开发的博客前台
- **管理后台容器 (blog-admin)**: Vue3开发的后台管理系统
- **后端API容器 (blog-nest)**: NestJS开发的后端服务
- **MySQL容器**: 数据库服务
- **Redis容器**: 缓存服务
- **Nginx容器**: 反向代理，路由请求到相应的服务

### 部署架构图

系统采用Docker容器化部署，使用Docker Compose编排各个服务。部署架构如下：

```
                      ┌─────────────┐
                      │    Nginx    │
                      │  容器代理层  │
                      └─────┬───────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
   ┌───────▼──────┐  ┌──────▼───────┐  ┌─────▼───────┐
   │   blog-web   │  │  blog-admin  │  │  blog-nest  │
   │  前台博客容器 │  │ 管理后台容器  │  │ 后端API容器 │
   └──────────────┘  └──────────────┘  └──────┬──────┘
                                              │
                                  ┌───────────┴───────────┐
                                  │                       │
                          ┌───────▼───────┐      ┌────────▼────────┐
                          │     mysql     │      │      redis      │
                          │   数据库容器   │      │    缓存容器     │
                          └───────────────┘      └─────────────────┘
```

## 服务访问

系统部署完成后，可通过以下URL访问：

- 博客前台：https://youserver.com 或 https://www.youserver.com
- 管理后台：https://admin.youserver.com
- API服务：https://api.youserver.com

## 网络架构

系统使用Nginx作为前端代理，根据不同的子域名将请求路由到不同的服务：

- `youserver.com` -> 前台博客(blog-web)
- `admin.youserver.com` -> 管理后台(blog-admin)
- `api.youserver.com` -> 后端API(blog-nest)

每个服务都有自己的Nginx配置，支持静态资源缓存和WebSocket连接。

## 环境变量配置

前端项目中的环境变量在构建时被注入，主要通过Dockerfile中的ENV指令设置：

```dockerfile
# 示例(blog-web.Dockerfile)
ENV VITE_BASE_URL=/
ENV VITE_SERVICE_BASE_URL=https://api.youserver.com
```

## 项目维护

- 使用`docker compose logs`查看容器日志
- 使用`docker compose restart <service_name>`重启特定服务
- 使用`./deploy.sh --rebuild`完全重建服务

## 贡献指南

欢迎贡献代码或提出建议。请遵循项目的代码风格和贡献指南。
