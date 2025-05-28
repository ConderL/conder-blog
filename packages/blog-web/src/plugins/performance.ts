import { App } from 'vue';
import PerformanceMonitor from '@/components/Performance/Monitor.vue';

export default function(app: App) {
    // 注册性能监控组件
    app.component('PerformanceMonitor', PerformanceMonitor);
};