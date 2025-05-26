<template>
  <div class="about-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">关于博客</h1>
      </div>
      
      <div class="about-content">
        <div class="about-section">
          <h2 class="section-title">博客介绍</h2>
          <div class="section-content markdown-body">
            <p>欢迎来到我的技术博客！这是一个专注于前端和全栈开发的博客网站，我会在这里分享我的技术经验、心得体会以及学习笔记。</p>
            <p>该博客基于 Nuxt.js 构建，采用服务端渲染技术提升网站性能和SEO效果。后端采用 Nest.js 提供数据支持，整体采用 TypeScript 开发，确保代码质量和类型安全。</p>
            <p>网站的主要功能包括：</p>
            <ul>
              <li>文章浏览与阅读</li>
              <li>分类与标签筛选</li>
              <li>时间轴归档</li>
              <li>文章评论交流</li>
              <li>响应式设计，支持各种设备访问</li>
            </ul>
          </div>
        </div>
        
        <div class="about-section">
          <h2 class="section-title">关于我</h2>
          <div class="section-content markdown-body">
            <p>我是一名热爱技术的全栈开发工程师，拥有多年的前端和后端开发经验。专注于以下技术栈：</p>
            <ul>
              <li>前端：Vue.js、React、TypeScript、Nuxt.js</li>
              <li>后端：Nest.js、Node.js、Express</li>
              <li>数据库：MySQL、MongoDB、Redis</li>
              <li>其他：Docker、微服务架构、CI/CD</li>
            </ul>
            <p>在这个快速发展的技术领域，我坚持不断学习，保持对新技术的敏感度和探索精神。同时，我也乐于分享我的经验和知识，希望能够帮助到更多的开发者。</p>
          </div>
        </div>
        
        <div class="about-section">
          <h2 class="section-title">联系方式</h2>
          <div class="section-content">
            <div class="contact-list">
              <div class="contact-item">
                <div class="contact-icon">📧</div>
                <div class="contact-info">
                  <span class="contact-label">邮箱：</span>
                  <a href="mailto:example@example.com" class="contact-link">example@example.com</a>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon">🌐</div>
                <div class="contact-info">
                  <span class="contact-label">GitHub：</span>
                  <a href="https://github.com" target="_blank" class="contact-link">github.com/example</a>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon">💬</div>
                <div class="contact-info">
                  <span class="contact-label">Twitter：</span>
                  <a href="https://twitter.com" target="_blank" class="contact-link">twitter.com/example</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="about-section">
          <h2 class="section-title">版权声明</h2>
          <div class="section-content markdown-body">
            <p>本站所有原创内容采用<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank">知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议</a>进行许可。</p>
            <p>转载请注明出处：<a href="/">博客网站</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义页面元数据
definePageMeta({
  title: '关于'
});

// SEO优化
useHead({
  title: '关于博客',
  meta: [
    { name: 'description', content: '了解博客网站的详细信息、博主介绍以及联系方式' },
    { name: 'keywords', content: '关于,博客,博主,介绍,联系方式,技术栈' }
  ]
});
</script>

<style scoped>
.about-page {
  background-color: #f8f9fa;
  padding: 2rem 0;
  min-height: 70vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
}

.page-title:after {
  content: '';
  position: absolute;
  left: 25%;
  right: 25%;
  bottom: 0;
  height: 3px;
  background-color: #0070f3;
  border-radius: 1.5px;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.about-section {
  margin-bottom: 2.5rem;
}

.about-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
  position: relative;
  padding-left: 1rem;
}

.section-title:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  height: 1.5rem;
  width: 4px;
  background-color: #0070f3;
  border-radius: 2px;
}

.section-content {
  color: #444;
  line-height: 1.7;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
}

.contact-label {
  font-weight: 600;
  margin-right: 0.5rem;
}

.contact-link {
  color: #0070f3;
  text-decoration: none;
  transition: color 0.3s;
}

.contact-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .about-content {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}
</style> 