<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <UInput v-model="inputValue" placeholder="请输入内容" />
  </div>
</template>

<script setup>
const inputValue = ref('')
</script>

