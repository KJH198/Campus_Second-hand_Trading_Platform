import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import GoodDetails from '../views/GoodDetails.vue'
import UserProfile from '../views/UserProfile.vue'
import Manager from '../views/Manager.vue'
import ContactUs from '../views/ContactUs.vue'

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
    },
    {
      path: '/manager',
      name: 'manager',
      component: Manager
    },
    {
      path: '/order/:orderId',
      name: 'OrderDetails',
      component: () => import('../views/OrderDetails.vue')
    },
    {
      path: '/contact',
      name: 'ContactUs',
      component: ContactUs
    }
  ]
})

router.beforeEach((to, from, next) => {
  console.log('Current routes:', router.getRoutes().map(r => r.path))
  console.log('Navigating to:', to.path)
  next()
})

export default router
