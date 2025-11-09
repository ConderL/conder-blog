# Dify AI 集成模块

本模块提供了与 Dify AI 平台的集成功能，支持聊天对话、数据集管理、工作流运行等功能。

## 功能特性

- ✅ 聊天对话（支持阻塞和流式响应）
- ✅ 数据集文档管理（创建、更新、删除）
- ✅ 工作流运行
- ✅ 文章内容生成
- ✅ 文章摘要生成
- ✅ SEO 元数据生成
- ✅ 标签推荐

## 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# Dify API 配置
DIFY_BASE_URL=https://api.dify.ai
DIFY_API_KEY=your-dify-api-key
DIFY_DATASET_ID=your-dataset-id  # 可选，用于数据集操作
```

## API 接口

### 1. 聊天对话

```http
POST /api/ai/dify/chat
Content-Type: application/json

{
  "query": "你好",
  "inputs": {},
  "response_mode": "blocking",
  "user": "user-123",
  "conversation_id": "conv-123"
}
```

### 2. 创建/更新数据集文档

```http
POST /api/ai/dify/datasets/{datasetId}/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "文章标题",
  "text": "文章内容...",
  "metadata": {
    "source": "blog",
    "category": "tech"
  }
}
```

### 3. 删除数据集文档

```http
DELETE /api/ai/dify/datasets/{datasetId}/documents/{documentId}
Authorization: Bearer <token>
```

### 4. 运行工作流

```http
POST /api/ai/dify/workflows/{workflowId}/run
Authorization: Bearer <token>
Content-Type: application/json

{
  "inputs": {
    "text": "要审核的内容"
  },
  "response_mode": "blocking",
  "user": "user-123"
}
```

### 5. 生成文章内容

```http
POST /api/ai/dify/generate/article-content
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nuxt3 SSR最佳实践",
  "outline": "1. 介绍\n2. 配置\n3. 优化",
  "context": "基于现有博客系统",
  "userId": "user-123"
}
```

### 6. 生成文章摘要

```http
POST /api/ai/dify/generate/article-summary
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "文章内容...",
  "maxLength": 200,
  "userId": "user-123"
}
```

### 7. 生成 SEO 元数据

```http
POST /api/ai/dify/generate/seo-meta
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "文章标题",
  "content": "文章内容...",
  "userId": "user-123"
}
```

### 8. 推荐标签

```http
POST /api/ai/dify/suggest/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "文章标题",
  "content": "文章内容...",
  "userId": "user-123"
}
```

## 使用示例

### 在 Service 中使用

```typescript
import { DifyService } from '../modules/dify/services/dify.service';

@Injectable()
export class ArticleService {
  constructor(private readonly difyService: DifyService) {}

  async createArticleWithAI(title: string, outline: string) {
    // 生成文章内容
    const content = await this.difyService.generateArticleContent(
      title,
      outline,
    );

    // 生成摘要
    const summary = await this.difyService.generateArticleSummary(content);

    // 生成SEO元数据
    const seoMeta = await this.difyService.generateSEOMeta(title, content);

    // 推荐标签
    const tags = await this.difyService.suggestTags(title, content);

    // 创建文章...
    return { content, summary, seoMeta, tags };
  }
}
```

### 同步文章到数据集

```typescript
async syncArticleToDataset(article: Article) {
  await this.difyService.upsertDatasetDocument(
    process.env.DIFY_DATASET_ID,
    {
      name: article.articleTitle,
      text: article.articleContent,
      id: `article-${article.id}`,
      metadata: {
        source: 'blog',
        category: article.category?.categoryName,
        tags: article.tags?.map(t => t.tagName),
      },
    },
  );
}
```

## 注意事项

1. 所有 API 接口都需要 JWT 认证（除了特殊标记为 Public 的接口，当前聊天接口为 Public）
2. Dify API Key 需要从 Dify 平台获取
3. 数据集操作需要先创建数据集并获取 Dataset ID
4. 工作流运行需要先配置工作流并获取 Workflow ID
5. 建议在生产环境中配置合理的超时时间

## 错误处理

服务会自动处理常见的错误情况：

- API Key 未配置：会在日志中输出警告，但不会中断应用启动
- 请求失败：会记录错误日志并抛出异常
- 网络超时：默认超时时间为 30 秒

## 扩展功能

可以根据需要扩展以下功能：

- 流式响应处理（SSE）
- 批量操作支持
- 缓存机制
- 重试机制
- 速率限制


