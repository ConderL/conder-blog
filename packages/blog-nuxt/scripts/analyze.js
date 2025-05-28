/**
 * 打包分析脚本
 * 用于分析 Nuxt 应用的打包大小
 * 使用方法：node scripts/analyze.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置环境变量，启用打包分析
process.env.NUXT_ANALYZE = 'true';

// 运行打包命令
console.log('开始分析打包大小...');
try {
  execSync('npx nuxt build --analyze', { stdio: 'inherit' });
  console.log('打包分析完成！');
} catch (error) {
  console.error('打包分析失败:', error);
  process.exit(1);
}

// 分析大型组件
console.log('\n分析大型组件...');
const distDir = path.join(__dirname, '../.nuxt/dist/client/_nuxt');

if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  
  // 按大小排序
  const sizeMap = files
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      return {
        file,
        size: stats.size,
        sizeInMB: (stats.size / (1024 * 1024)).toFixed(2)
      };
    })
    .sort((a, b) => b.size - a.size);
  
  // 输出前10个最大的文件
  console.log('\n最大的10个JS文件:');
  sizeMap.slice(0, 10).forEach((item, index) => {
    console.log(`${index + 1}. ${item.file}: ${item.sizeInMB} MB`);
  });
  
  // 提供优化建议
  console.log('\n优化建议:');
  console.log('1. 对大于300KB的文件考虑进一步代码分割');
  console.log('2. 使用 LazyXXX 组件懒加载大型组件');
  console.log('3. 检查是否有重复依赖或未使用的导入');
  console.log('4. 考虑使用动态导入 () => import("./Component")');
} else {
  console.log('找不到打包目录，请先运行 nuxt build');
} 