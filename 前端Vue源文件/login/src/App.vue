<script setup>
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<style>
#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'microsoft yahei', arial, STHeiTi, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Element Plus 主题覆盖 */
:root {
  --el-color-primary: #ff5000;
  --el-color-primary-light-3: #ff6a00;
  --el-color-primary-light-5: #ff8534;
  --el-color-primary-light-7: #ffa066;
  --el-color-primary-light-9: #ffcca6;
}
</style>

