export default {
  // 禁用原生模块支持
  context: 'node',
  onwarn: (warning, warn) => {
    // 忽略某些警告
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
    warn(warning);
  },
  // 提供直接的替代方案
  plugins: []
}; 