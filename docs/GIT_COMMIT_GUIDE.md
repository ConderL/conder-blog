# Git提交规范指南

本项目使用了以下工具来规范Git提交流程：

- **husky**: Git钩子工具，用于在Git工作流程中执行脚本
- **commitlint**: 用于检查提交信息是否符合规范
- **commitizen**: 交互式工具，帮助生成符合规范的提交信息
- **lint-staged**: 只对暂存区的文件执行lint检查

## 提交流程

1. 暂存更改：`git add .` 或 `git add <文件路径>`
2. 使用规范化提交工具：`pnpm commit` 代替 `git commit`
3. 按照交互式提示选择提交类型、范围和描述
4. 推送更改：`git push`

## 提交类型

提交信息的格式为：`<type>(<scope>): <subject>`

常用的提交类型（type）包括：

- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档变更
- **style**: 代码格式（不影响代码运行的变动）
- **refactor**: 重构（既不是新增功能，也不是修改bug的代码变动）
- **perf**: 性能优化
- **test**: 增加测试
- **chore**: 构建过程或辅助工具的变动
- **revert**: 回退
- **build**: 打包
- **ci**: 持续集成

## 示例

```
feat(user): 添加用户注册功能
```

```
fix(blog): 修复文章列表分页问题
```

```
docs(api): 更新API文档
```

## 自动检查

本项目配置了以下自动检查机制：

1. **pre-commit钩子**: 提交前自动运行lint-staged，检查代码格式
2. **commit-msg钩子**: 提交时自动检查提交信息是否符合规范

如果提交不符合规范，Git将中止提交过程并显示错误信息。

## 配置文件

- `.husky/`: husky配置目录
- `commitlint.config.js`: commitlint配置文件
- `.czrc`: commitizen配置文件
- `package.json中的lint-staged配置`: lint-staged配置 