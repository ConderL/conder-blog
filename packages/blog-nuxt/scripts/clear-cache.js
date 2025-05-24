// 清除 Nuxt 缓存的脚本
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要清除的目录
const cacheDirs = [
  '.nuxt',
  '.output',
  'node_modules/.vite',
  'node_modules/.cache'
];

// 清除缓存目录
function clearCache() {
  console.log('开始清除缓存...');
  
  const rootDir = path.resolve(__dirname, '..');
  
  cacheDirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    if (fs.existsSync(fullPath)) {
      console.log(`删除目录: ${fullPath}`);
      try {
        if (process.platform === 'win32') {
          // Windows 平台使用 rimraf 命令
          execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'inherit' });
        } else {
          // Unix 平台使用 rm 命令
          execSync(`rm -rf "${fullPath}"`, { stdio: 'inherit' });
        }
        console.log(`✅ 成功删除: ${dir}`);
      } catch (error) {
        console.error(`❌ 删除失败: ${dir}`, error);
      }
    } else {
      console.log(`目录不存在，跳过: ${fullPath}`);
    }
  });
  
  console.log('缓存清除完成!');
}

// 执行清除
clearCache(); 