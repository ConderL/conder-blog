// 复制SVG图标到public目录
const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = path.resolve(__dirname, '../assets/icons');
const targetDir = path.resolve(__dirname, '../public/icons');

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制文件
function copyFiles() {
  // 读取源目录中的所有文件
  const files = fs.readdirSync(sourceDir);
  
  // 复制每个SVG文件
  let count = 0;
  files.forEach(file => {
    if (file.endsWith('.svg')) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath);
      count++;
    }
  });
  
  console.log(`成功复制 ${count} 个SVG图标到 public/icons 目录`);
}

// 执行复制
copyFiles(); 