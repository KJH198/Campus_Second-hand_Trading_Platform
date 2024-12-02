import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import HomeView from '../views/HomeView.vue'
import GoodDetails from '../views/GoodDetails.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/goodsdetails/:productId',
    name: 'GoodDetails',
    component: GoodDetails
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
