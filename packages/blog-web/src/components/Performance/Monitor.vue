<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h3>性能监控</h3>
      <button class="close-btn" @click="showMonitor = false">关闭</button>
    </div>
    <div class="monitor-content">
      <div class="metric-group">
        <h4>基本指标</h4>
        <div class="metric-item">
          <span class="metric-name">总加载时间:</span>
          <span class="metric-value">{{ metrics.pageLoadTime }}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-name">DOM准备时间:</span>
          <span class="metric-value">{{ metrics.domReadyTime }}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-name">首次绘制 (FP):</span>
          <span class="metric-value">{{ metrics.firstPaintTime }}ms</span>
        </div>
      </div>
      
      <div class="metric-group">
        <h4>Core Web Vitals</h4>
        <div class="metric-item">
          <span class="metric-name">FCP:</span>
          <span class="metric-value">{{ metrics.fcp }}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-name">LCP:</span>
          <span class="metric-value">{{ metrics.lcp }}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-name">CLS:</span>
          <span class="metric-value">{{ metrics.cls }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-name">INP:</span>
          <span class="metric-value">{{ metrics.inp }}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-name">TTFB:</span>
          <span class="metric-value">{{ metrics.ttfb }}ms</span>
        </div>
      </div>
      
      <div class="metric-group">
        <h4>资源统计</h4>
        <div class="metric-item">
          <span class="metric-name">JS资源:</span>
          <span class="metric-value">{{ metrics.jsResourceCount }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-name">CSS资源:</span>
          <span class="metric-value">{{ metrics.cssResourceCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// 默认不显示监控面板
const showMonitor = ref(false);

const metrics = reactive({
  pageLoadTime: 0,
  domReadyTime: 0,
  firstPaintTime: 0,
  firstContentfulPaintTime: 0,
  fcp: 0,
  lcp: 0,
  cls: 0,
  inp: 0,
  ttfb: 0,
  jsResourceCount: 0,
  cssResourceCount: 0
});

onMounted(() => {
  // 立即收集可用的性能指标
  collectBasicMetrics();
  
  // 使用 web-vitals 收集 Core Web Vitals 指标
  collectWebVitals();
  
  // 页面完全加载后收集更多指标
  window.addEventListener('load', () => {
    collectBasicMetrics();
    collectResourceMetrics();
  });
  
  // 添加全局方法，通过控制台命令显示性能面板
  window.showPerformanceMonitor = () => {
    showMonitor.value = true;
    console.log('%c性能监控面板已显示', 'color: #42b983; font-weight: bold');
  };
  
  window.hidePerformanceMonitor = () => {
    showMonitor.value = false;
    console.log('%c性能监控面板已隐藏', 'color: #42b983; font-weight: bold');
  };
  
  // 输出使用说明
  console.log('%c要显示性能监控面板，请在控制台执行: showPerformanceMonitor()', 'color: #42b983');
});

function collectBasicMetrics() {
  const performance = window.performance;
  if (!performance) return;

  // 获取性能指标
  const timing = performance.timing;
  
  if (timing.loadEventEnd > 0) {
    // 计算关键性能指标
    metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    metrics.domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
    
    // 输出到控制台
    console.log('%c===== Vue SPA 性能指标 =====', 'color: #42b983; font-weight: bold');
    console.log(`总加载时间: ${metrics.pageLoadTime}ms`);
    console.log(`DOM准备时间: ${metrics.domReadyTime}ms`);
  }
  
  // 收集绘制指标
  const entries = performance.getEntriesByType('paint');
  const fpEntry = entries.find(entry => entry.name === 'first-paint');
  const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
  
  if (fpEntry) {
    metrics.firstPaintTime = Math.round(fpEntry.startTime);
    console.log(`首次绘制 (FP): ${metrics.firstPaintTime}ms`);
  }
  
  if (fcpEntry) {
    metrics.firstContentfulPaintTime = Math.round(fcpEntry.startTime);
    console.log(`首次内容绘制 (FCP): ${metrics.firstContentfulPaintTime}ms`);
  }
}

function collectResourceMetrics() {
  const performance = window.performance;
  if (!performance) return;
  
  // 获取资源加载时间
  const resources = performance.getEntriesByType('resource');
  metrics.jsResourceCount = resources.filter(resource => resource.name.endsWith('.js')).length;
  metrics.cssResourceCount = resources.filter(resource => resource.name.endsWith('.css')).length;
}

function collectWebVitals() {
  // 累积布局偏移 (CLS)
  onCLS(metric => {
    metrics.cls = parseFloat(metric.value.toFixed(3));
    console.log(`%c[Vue SPA] CLS: ${metric.value.toFixed(3)}`, 'color: #42b983');
  });
  
  // 首次内容绘制 (FCP)
  onFCP(metric => {
    metrics.fcp = Math.round(metric.value);
    console.log(`%c[Vue SPA] FCP: ${metric.value.toFixed(2)}ms`, 'color: #42b983');
  });
  
  // 交互到下一次绘制 (INP)
  onINP(metric => {
    metrics.inp = Math.round(metric.value);
    console.log(`%c[Vue SPA] INP: ${metric.value.toFixed(2)}ms`, 'color: #42b983');
  });
  
  // 最大内容绘制 (LCP)
  onLCP(metric => {
    metrics.lcp = Math.round(metric.value);
    console.log(`%c[Vue SPA] LCP: ${metric.value.toFixed(2)}ms`, 'color: #42b983');
  });
  
  // 首字节时间 (TTFB)
  onTTFB(metric => {
    metrics.ttfb = Math.round(metric.value);
    console.log(`%c[Vue SPA] TTFB: ${metric.value.toFixed(2)}ms`, 'color: #42b983');
  });
}
</script>

<style scoped lang="scss">
.performance-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  padding: 12px;
  font-size: 12px;
  
  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
    
    .close-btn {
      padding: 2px 8px;
      font-size: 12px;
      background-color: #f3f3f3;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background-color: #e9e9e9;
      }
    }
  }
  
  .metric-group {
    margin-bottom: 10px;
    
    h4 {
      margin: 0 0 5px;
      font-size: 13px;
      font-weight: 600;
      color: #42b983;
    }
  }
  
  .metric-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    
    .metric-name {
      color: #666;
    }
    
    .metric-value {
      font-weight: 500;
    }
  }
}
</style> 