<template>
    <div style="display: flex; height: 100vh;">
        <!-- Left Sidebar Menu -->
        <aside style="min-width: 200px; border-right: 1px solid #ccc; padding: 1rem;">
            <ul style="list-style: none; padding: 0; margin: 0;">
                <li v-for="item in componentsList" :key="item.name" style="margin-bottom: 0.5rem;" >
                    <button 
                        @click="loadComponent(item)" 
                        :class="['menu-button', { active: currentComponentName === item.name }]"
                        style="width: 100%; padding: 0.5rem; cursor: pointer;"
                    >
                        {{ item.name }}
                    </button>
                </li>
            </ul>
        </aside>
        
        <!-- Main Content Area -->
        <section style="flex: 1;">
            <component v-if="currentComponent" :is="currentComponent" />
            <div v-else>Please select a component from the menu.</div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef } from 'vue';
import { defineAsyncComponent } from 'vue';

// Use Vite's import.meta.glob to get all Vue component files under ./components
const componentFiles = import.meta.glob('./components/*.vue');

interface ComponentItem {
    name: string;
    path: string;
    loader: () => Promise<any>;
}

const componentsList = Object.keys(componentFiles).map(path => {
    // Extract filename without extension (e.g. demo3 from "./components/demo3.vue")
    const match = path.match(/\.\/components\/(.*)\.vue$/);
    const name = match ? match[1] : path;
    return {
        name,
        path,
        loader: componentFiles[path] as () => Promise<any>
    };
});

onMounted(() => {
    // 从hash中获取当前选中的组件
    const hash = window.location.hash.replace('#', '');
    const selectedComponent = hash || 
        (componentsList.length > 0 ? componentsList[componentsList.length - 1].name : '');
    if (selectedComponent) {
        const item = componentsList.find(c => c.name === selectedComponent);
        if (item) {
            loadComponent(item);
        }
    }
})

const currentComponent = shallowRef();
const currentComponentName = ref('');
// When a menu item is clicked, load the component dynamically
function loadComponent(item: ComponentItem) {
    // 更新hash
    window.location.hash = item.name;
    // 先清空当前组件
    currentComponent.value = null;
    // 强制重新渲染
    nextTick(() => {
        currentComponentName.value = item.name;
        currentComponent.value = defineAsyncComponent(() => item.loader());
    });
}
</script>

<style scoped>
.menu-button {
    background-color: #fff;
    border: 1px solid #ccc;
    transition: all 0.2s ease;
}

.menu-button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}
</style>