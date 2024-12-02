import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import GoodDetails from '../views/GoodDetails.vue'
import UserProfile from '../views/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/goods/:productId',
      name: 'GoodDetails',
      component: GoodDetails
    },
    {
      path: '/profile',
      name: 'UserProfile',
      component: UserProfile
    }
  ]
})

export default router
