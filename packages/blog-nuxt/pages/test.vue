<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">AutoAnimate测试页面</h1>
    
    <div class="space-y-12">
      <!-- 方式1: 使用指令 v-auto-animate -->
      <div>
        <h2 class="text-xl font-semibold mb-2">方式1: 使用v-auto-animate指令</h2>
        <p class="mb-2">直接在容器上添加v-auto-animate指令，简单直接</p>
        
        <div class="flex space-x-4 mb-4">
          <UButton @click="showList1 = !showList1">{{ showList1 ? '隐藏' : '显示' }}列表</UButton>
          <UButton @click="addItem1">添加项目</UButton>
          <UButton @click="removeItem1" :disabled="items1.length === 0">删除项目</UButton>
          <UButton @click="shuffleItems1" :disabled="items1.length < 2">打乱顺序</UButton>
        </div>
        
        <div v-auto-animate class="bg-gray-100 p-4 rounded-lg min-h-[200px]">
          <div v-if="showList1" class="space-y-2">
            <div 
              v-for="(item, index) in items1" 
              :key="item.id"
              class="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <span>{{ item.text }}</span>
              <UButton color="red" size="sm" icon="i-heroicons-trash" @click="() => removeItemAt1(index)" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 方式2: 使用useAutoAnimate组合函数 -->
      <div>
        <h2 class="text-xl font-semibold mb-2">方式2: 使用useAutoAnimate组合函数</h2>
        <p class="mb-2">通过ref引用元素并使用组合函数应用动画</p>
        
        <div class="flex space-x-4 mb-4">
          <UButton @click="showList2 = !showList2">{{ showList2 ? '隐藏' : '显示' }}列表</UButton>
          <UButton @click="addItem2">添加项目</UButton>
          <UButton @click="removeItem2" :disabled="items2.length === 0">删除项目</UButton>
          <UButton @click="shuffleItems2" :disabled="items2.length < 2">打乱顺序</UButton>
        </div>
        
        <div ref="container2" class="bg-gray-100 p-4 rounded-lg min-h-[200px]">
          <div v-if="showList2" class="space-y-2">
            <div 
              v-for="(item, index) in items2" 
              :key="item.id"
              class="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <span>{{ item.text }}</span>
              <UButton color="red" size="sm" icon="i-heroicons-trash" @click="() => removeItemAt2(index)" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 方式3: 使用插件提供的$autoAnimate -->
      <div>
        <h2 class="text-xl font-semibold mb-2">方式3: 使用插件提供的$autoAnimate</h2>
        <p class="mb-2">通过Nuxt插件提供的全局方法应用动画</p>
        
        <div class="flex space-x-4 mb-4">
          <UButton @click="showList3 = !showList3">{{ showList3 ? '隐藏' : '显示' }}列表</UButton>
          <UButton @click="addItem3">添加项目</UButton>
          <UButton @click="removeItem3" :disabled="items3.length === 0">删除项目</UButton>
          <UButton @click="shuffleItems3" :disabled="items3.length < 2">打乱顺序</UButton>
        </div>
        
        <div ref="container3" class="bg-gray-100 p-4 rounded-lg min-h-[200px]">
          <div v-if="showList3" class="space-y-2">
            <div 
              v-for="(item, index) in items3" 
              :key="item.id"
              class="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <span>{{ item.text }}</span>
              <UButton color="red" size="sm" icon="i-heroicons-trash" @click="() => removeItemAt3(index)" />
            </div>
          </div>
        </div>
      </div>

      <!-- 布局切换动画示例 -->
      <div>
        <h2 class="text-xl font-semibold mb-2">布局切换示例</h2>
        <p class="mb-2">模拟文章页面的侧边栏切换动画</p>
        
        <UButton @click="showSidebar = !showSidebar" class="mb-4">
          {{ showSidebar ? '隐藏' : '显示' }}侧边栏
        </UButton>
        
        <div v-auto-animate="{duration: 300}" class="flex bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[300px]">
          <div class="bg-white rounded-lg p-4 shadow-sm" :style="showSidebar ? 'width: calc(100% - 250px)' : 'width: 100%'" key="main">
            <h3 class="font-bold text-lg mb-2">主内容区域</h3>
            <p>这里是文章内容，当侧边栏切换时，主内容区域的宽度会动态变化。</p>
            <p class="mt-4">注意观察宽度变化的动画效果。</p>
          </div>
          
          <div v-if="!showSidebar" class="ml-4 bg-white rounded-lg p-4 shadow-sm w-[250px]" key="sidebar">
            <h3 class="font-bold text-lg mb-2">侧边栏</h3>
            <p>这里是侧边栏内容，可以包含目录、推荐文章等。</p>
            <div class="mt-4 space-y-2">
              <div v-for="i in 3" :key="i" class="p-2 bg-gray-50 rounded">推荐文章 {{ i }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAutoAnimate } from '~/composables/useAutoAnimate';
import autoAnimate from '@formkit/auto-animate';

definePageMeta({
  title: 'AutoAnimate测试'
});

// 方式1: 使用指令
const showList1 = ref(true);
const items1 = ref([
  { id: 1, text: '项目 1' },
  { id: 2, text: '项目 2' },
  { id: 3, text: '项目 3' },
]);

function addItem1() {
  const id = Math.max(0, ...items1.value.map(item => item.id)) + 1;
  items1.value.push({ id, text: `项目 ${id}` });
}

function removeItem1() {
  if (items1.value.length > 0) {
    items1.value.pop();
  }
}

function removeItemAt1(index) {
  items1.value.splice(index, 1);
}

function shuffleItems1() {
  items1.value = [...items1.value].sort(() => Math.random() - 0.5);
}

// 方式2: 使用useAutoAnimate组合函数
const showList2 = ref(true);
const items2 = ref([
  { id: 1, text: '项目 1' },
  { id: 2, text: '项目 2' },
  { id: 3, text: '项目 3' },
]);
const { parent: container2 } = useAutoAnimate({
  duration: 300,
  easing: 'ease-in-out'
});

function addItem2() {
  const id = Math.max(0, ...items2.value.map(item => item.id)) + 1;
  items2.value.push({ id, text: `项目 ${id}` });
}

function removeItem2() {
  if (items2.value.length > 0) {
    items2.value.pop();
  }
}

function removeItemAt2(index) {
  items2.value.splice(index, 1);
}

function shuffleItems2() {
  items2.value = [...items2.value].sort(() => Math.random() - 0.5);
}

// 方式3: 使用插件提供的$autoAnimate
const showList3 = ref(true);
const items3 = ref([
  { id: 1, text: '项目 1' },
  { id: 2, text: '项目 2' },
  { id: 3, text: '项目 3' },
]);
const container3 = ref(null);

function addItem3() {
  const id = Math.max(0, ...items3.value.map(item => item.id)) + 1;
  items3.value.push({ id, text: `项目 ${id}` });
}

function removeItem3() {
  if (items3.value.length > 0) {
    items3.value.pop();
  }
}

function removeItemAt3(index) {
  items3.value.splice(index, 1);
}

function shuffleItems3() {
  items3.value = [...items3.value].sort(() => Math.random() - 0.5);
}

// 布局切换示例
const showSidebar = ref(false);

// 在组件挂载后初始化方式3
onMounted(() => {
  const { $autoAnimate } = useNuxtApp();
  if (container3.value && $autoAnimate) {
    $autoAnimate(container3.value, {
      duration: 300,
      easing: 'ease-in-out'
    });
  }
});
</script>

<style scoped>
/* 确保没有冲突的样式 */
</style>