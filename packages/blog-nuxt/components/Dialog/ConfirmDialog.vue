<template>
  <UModal v-if="isOpen" v-model="isOpen" :ui="ui">
    <template #header>
      <div class="flex items-center gap-2">
        <div v-if="icon" class="flex-shrink-0">
          <div :class="[`text-${color}-500 dark:text-${color}-400`]">
            <UIcon :name="icon" class="text-xl icon" />
          </div>
        </div>
        <div class="text-lg font-semibold leading-6">
          {{ title }}
        </div>
      </div>
    </template>

    <template #default>
      <div class="mt-2 text-gray-600 dark:text-gray-400">
        {{ message }}
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          v-if="showCancel"
          color="gray"
          variant="soft"
          :label="cancelLabel"
          @click="onCancelClick"
        />
        <UButton
          :color="color"
          :label="confirmLabel"
          @click="onConfirmClick"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value)
  },
  confirmLabel: {
    type: String,
    default: '确定'
  },
  cancelLabel: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close']);

// 图标映射
const iconMap = {
  info: 'i-heroicons-information-circle',
  success: 'i-heroicons-check-circle',
  warning: 'i-heroicons-exclamation-triangle',
  danger: 'i-heroicons-exclamation-circle'
};

// 颜色映射
const colorMap = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  danger: 'red'
};

// 计算属性
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const icon = computed(() => iconMap[props.type]);
const color = computed(() => colorMap[props.type]);

// 自定义UI
const ui = computed(() => ({
  wrapper: 'items-center',
  container: 'max-w-md'
}));

// 事件处理
function onConfirmClick() {
  emit('confirm');
  emit('close', true); // 为 useOverlay 添加关闭事件并返回结果
  isOpen.value = false;
}

function onCancelClick() {
  emit('cancel');
  emit('close', false); // 为 useOverlay 添加关闭事件并返回结果
  isOpen.value = false;
}

// 确保在组件卸载时触发关闭事件
onBeforeUnmount(() => {
  if (isOpen.value) {
    emit('close', false);
  }
});
</script> 