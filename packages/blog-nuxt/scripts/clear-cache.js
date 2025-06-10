// 清除 Nuxt 缓存的脚本
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');

// 需要清理的目录
const dirsToClean = [
  '.nuxt',
  '.output',
  'node_modules/.vite',
  'node_modules/.cache'
];

console.log('🧹 清理缓存中...');

// 清理每个目录
dirsToClean.forEach(dir => {
  const path = resolve(rootDir, dir);
  if (existsSync(path)) {
    try {
      rmSync(path, { recursive: true, force: true });
      console.log(`✅ 已清理: ${dir}`);
    } catch (error) {
      console.error(`❌ 清理失败: ${dir}`, error);
    }
  } else {
    console.log(`ℹ️ 目录不存在，跳过: ${dir}`);
  }
});

console.log('🎉 缓存清理完成!'); 