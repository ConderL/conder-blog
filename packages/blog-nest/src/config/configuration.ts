export default () => ({
  app: {
    name: "conder's blog",
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'blog',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  // RSA 私钥配置
  rsa: {
    privateKey: process.env.RSA_PRIVATE_KEY || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  // 邮箱配置
  mail: {
    host: process.env.MAIL_HOST || 'smtp.163.com',
    port: parseInt(process.env.MAIL_PORT, 10) || 465,
    username: process.env.MAIL_USERNAME || '',
    password: process.env.MAIL_PASSWORD || '',
  },
  // 文件上传配置
  upload: {
    strategy: process.env.UPLOAD_STRATEGY || 'local',
    local: {
      path: process.env.UPLOAD_LOCAL_PATH || 'public/uploads/',
      url: process.env.UPLOAD_LOCAL_URL || 'http://localhost:3000/',
    },
    oss: {
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
      region: process.env.OSS_REGION || 'oss-cn-hangzhou',
      bucketName: process.env.OSS_BUCKET || '',
      endpoint: process.env.OSS_ENDPOINT || 'oss-cn-hangzhou.aliyuncs.com',
      cdnUrl: process.env.OSS_CDN_URL || '',
    },
    // 腾讯云COS配置
    cos: {
      url: process.env.UPLOAD_COS_URL || '',
      secretId: process.env.UPLOAD_COS_SECRET_ID || '',
      secretKey: process.env.UPLOAD_COS_SECRET_KEY || '',
      region: process.env.UPLOAD_COS_REGION || '',
      bucketName: process.env.UPLOAD_COS_BUCKET_NAME || '',
    },
    // 七牛云配置
    qiniu: {
      url: process.env.UPLOAD_QINIU_URL || '',
      bucketName: process.env.UPLOAD_QINIU_BUCKET_NAME || '',
      region: process.env.UPLOAD_QINIU_REGION || 'huanan',
      accessKey: process.env.UPLOAD_QINIU_ACCESS_KEY || '',
      secretKey: process.env.UPLOAD_QINIU_SECRET_KEY || '',
    },
  },
  // 第三方登录配置
  oauth: {
    // GitHub登录配置
    github: {
      clientId: process.env.OAUTH_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET || '',
      redirectUrl: process.env.OAUTH_GITHUB_REDIRECT_URL || '',
      accessTokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
    },
    // Gitee登录配置
    gitee: {
      clientId: process.env.OAUTH_GITEE_CLIENT_ID || '',
      clientSecret: process.env.OAUTH_GITEE_CLIENT_SECRET || '',
      grantType: 'authorization_code',
      redirectUrl: process.env.OAUTH_GITEE_REDIRECT_URL || '',
      accessTokenUrl: 'https://gitee.com/oauth/token',
      userInfoUrl: 'https://gitee.com/api/v5/user?access_token={access_token}',
    },
    // QQ登录配置
    qq: {
      appId: process.env.OAUTH_QQ_APP_ID || '',
      appKey: process.env.OAUTH_QQ_APP_KEY || '',
      grantType: 'authorization_code',
      redirectUrl: process.env.OAUTH_QQ_REDIRECT_URL || '',
      accessTokenUrl: 'https://graph.qq.com/oauth2.0/token',
      userOpenidUrl: 'https://graph.qq.com/oauth2.0/me',
      userInfoUrl: 'https://graph.qq.com/user/get_user_info',
    },
  },
  // 搜索配置
  search: {
    // 搜索模式: elasticsearch、mysql
    mode: process.env.SEARCH_MODE || 'mysql',
    // Elasticsearch配置
    elasticsearch: {
      username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD || 'elastic',
      hostname: process.env.ELASTICSEARCH_HOSTNAME || 'localhost',
      port: parseInt(process.env.ELASTICSEARCH_PORT, 10) || 9200,
      scheme: process.env.ELASTICSEARCH_SCHEME || 'http',
      connTimeout: parseInt(process.env.ELASTICSEARCH_CONN_TIMEOUT, 10) || 1000,
      socketTimeout: parseInt(process.env.ELASTICSEARCH_SOCKET_TIMEOUT, 10) || 30000,
      connectionRequestTimeout:
        parseInt(process.env.ELASTICSEARCH_CONNECTION_REQUEST_TIMEOUT, 10) || 5000,
    },
  },
  baidu: {
    apiKey: process.env.BAIDU_API_KEY || '',
    secretKey: process.env.BAIDU_SECRET_KEY || '',
  },
});
