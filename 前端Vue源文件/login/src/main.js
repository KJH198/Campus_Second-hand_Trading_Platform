import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)
//Vue.prototype.$host = 'http://127.0.0.1:5000'

app.use(router)
app.use(ElementPlus)
app.mount('#app')