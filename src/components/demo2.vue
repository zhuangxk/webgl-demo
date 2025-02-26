<template>
    <canvas id="webgl" ></canvas>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  import('../demo/demo002');
})
</script>