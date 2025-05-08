# 权限检查工具使用说明

## 使用方法

博客系统提供了两种权限检查方式：

### 1. 在setup组件中使用

```vue
<script setup>
import { checkPermission, checkRole } from "@/utils/permission";

// 然后在模板中直接使用
</script>

<template>
  <!-- 使用权限检查函数 -->
  <el-button v-if="checkPermission(['sys:user:add'])">添加用户</el-button>
  
  <!-- 使用角色检查函数 -->
  <el-menu-item v-if="checkRole(['admin'])">管理员菜单</el-menu-item>
</template>
```

### 2. 在选项式API中使用

```vue
<template>
  <!-- 使用全局方法 -->
  <el-button v-if="$checkPermission(['sys:user:add'])">添加用户</el-button>
</template>

<script>
export default {
  methods: {
    someMethod() {
      if (this.$checkPermission(['sys:user:edit'])) {
        // 有编辑权限，执行编辑操作
      } else {
        // 无权限提示
      }
    }
  }
}
</script>
```

### 3. 在JS代码中使用

```js
import { checkPermission } from "@/utils/permission";

function handleOperation() {
  if (checkPermission(['sys:user:delete'])) {
    // 有删除权限，执行删除操作
  } else {
    // 无权限处理
  }
}
```

## 注意事项

1. `checkPermission` 和 `checkRole` 函数都支持传入单个字符串或字符串数组
2. 当传入数组时，只要用户拥有其中任意一个权限，就会返回`true`
3. 管理员角色(角色ID为1)会自动拥有所有权限
4. 对于需要v-if控制的下拉菜单项，使用`v-if="checkPermission(['xxx:xxx:xxx'])"`
5. 对于需要禁用而不是隐藏的按钮，可以使用`:disabled="!checkPermission(['xxx:xxx:xxx'])"` 