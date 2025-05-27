<template>
  <div class="category-page">
    <!-- 页面头部 -->
    <ClientOnly>
      <div class="page-header">
        <h1 class="page-title">分类</h1>
        <img class="page-cover" :src="blog.blogInfo.siteConfig?.categoryWallpaper" alt="分类封面">
        <Waves></Waves>
      </div>
    </ClientOnly>
    
    <div class="bg">
      <div class="page-container">
        <!-- 使用 nuxt-echarts 提供的图表组件 -->
        <div class="chart-container">
          <VChart
            :option="chartOption"
            :init-options="{ renderer: 'svg', height: '400px' }"
            :theme="colorMode.value"
            class="pie-chart"
            autoresize
          />
        </div>
        
        <!-- 分类列表 -->
        <ul class="category-list">
          <li v-for="category in categoryList" :key="category.id" class="category-item">
            <NuxtLink :to="`/category/${category.id}`">{{ category.categoryName }}</NuxtLink>
            <span class="category-count">({{ category.articleCount }})</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, unref } from 'vue';
import { useBlogStore } from '~/stores';
import type { ECOption } from '#build/types/nuxt-echarts';

// 定义页面元数据
definePageMeta({
  title: '分类'
});

// 获取博客信息和当前颜色模式
const blog = useBlogStore();
const colorMode = useColorMode();

// 使用封装好的API
const { category: categoryApi } = useApi();
const { data } = await categoryApi.getCategoryList();
const categoryList = computed(() => unref(data) || []);

// 图表配置
const chartOption = reactive<ECOption>({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: computed(() => colorMode.value === 'dark' ? 'rgba(50,50,50,0.9)' : 'rgba(255,255,255,0.9)'),
    borderColor: computed(() => colorMode.value === 'dark' ? '#444' : '#ddd'),
    textStyle: {
      color: computed(() => colorMode.value === 'dark' ? '#eee' : '#333')
    }
  },
  title: {
    text: "文章分类统计图",
    left: "center",
    top: 10,
    textStyle: {
      color: computed(() => colorMode.value === 'dark' ? '#ffffff' : '#333333'),
      fontSize: 18,
      fontWeight: 'bold'
    }
  },
  legend: {
    orient: 'horizontal',
    bottom: 10,
    left: 'center',
    icon: 'circle',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: {
      color: computed(() => colorMode.value === 'dark' ? '#dddddd' : '#666666')
    }
  },
  series: [
    {
      name: '分类统计',
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: computed(() => colorMode.value === 'dark' ? '#333' : '#fff'),
        borderWidth: 1
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{c} 篇',
        color: computed(() => colorMode.value === 'dark' ? '#ddd' : '#333')
      },
      labelLine: {
        length: 10,
        length2: 10,
        smooth: true
      },
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        label: {
          show: true,
          fontWeight: 'bold',
          fontSize: 14
        }
      },
      data: []
    }
  ]
});

// 处理分类数据
watch(() => categoryList.value, (newList) => {
  // 清空旧数据
  chartOption.series[0].data = [];
  
  // 添加新数据
  if (newList && newList.length > 0) {
    const colors = ['#3AA1FF', '#36CBCB', '#4ECB73', '#FBD437', '#F2637B', '#975FE4', '#5B8FF9', '#FF9845'];
    
    newList.forEach((item, index) => {
      chartOption.series[0].data.push({
        value: item.articleCount,
        name: item.categoryName,
        itemStyle: {
          color: colors[index % colors.length]
        }
      });
    });
  }
}, { immediate: true });

// SEO优化
useHead({
  title: '分类 - ' + (blog.blogInfo.siteConfig?.siteName || '博客'),
  meta: [
    { 
      name: 'description', 
      content: '探索博客的文章分类，包含多个技术领域的精选文章' 
    },
    { 
      name: 'keywords', 
      content: '分类,博客,文章分类,技术博客' 
    }
  ]
});
</script>

<style lang="scss" scoped>
.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  background-color: var(--primary-color);
  
  .page-title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--header-text-color);
    position: relative;
    z-index: 1;
  }
  
  .page-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
}

.bg {
  background-color: var(--background-color);
  padding: 2rem 0;
  min-height: 70vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.chart-container {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.pie-chart {
  width: 100%;
  height: 500px;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.category-item {
  position: relative;
  padding: 0.12em 1.2em 0.12em 1.4em;
  margin: 0.5rem;
  
  &:before {
    display: inline-block;
    position: relative;
    left: -0.75rem;
    width: 12px;
    height: 12px;
    border: 0.2rem solid var(--color-blue);
    border-radius: 50%;
    background: var(--background-color);
    content: "";
    transition-duration: 0.3s;
  }
  
  &:hover:before {
    border: 0.2rem solid var(--color-orange);
  }
  
  a {
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.3s;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.category-count {
  margin-left: 0.5rem;
  font-size: 0.95rem;
  color: var(--grey-5);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem !important;
  }
  
  .pie-chart {
    height: 350px !important;
  }
  
  .chart-container {
    padding: 1rem;
  }
}
</style> 