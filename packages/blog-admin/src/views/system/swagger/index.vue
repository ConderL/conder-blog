<template>
  <i-frame v-model:src="url"></i-frame>
</template>

<script setup lang="ts">
import iFrame from "@/components/iFrame/index.vue";
import { getBaseURL } from "@/utils/request";
import { ref } from "vue";
const baseUrl = getBaseURL();
const url = ref(baseUrl + "/api/api-docs");
</script>
