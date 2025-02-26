<template>
    <canvas id="webgl" ></canvas>
    <div id="uiContainer">
      <div id="ui">
        <div id="x"></div>
        <div id="y"></div>
        <div id="angle"></div>
        <div id="scaleX"></div>
        <div id="scaleY"></div>
      </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  import('../demo/demo003');
})
</script>