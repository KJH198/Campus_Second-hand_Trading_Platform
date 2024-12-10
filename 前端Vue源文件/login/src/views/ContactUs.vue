<template>
  <div class="contact-us">
    <header class="nav-header">
      <div class="nav-container">
        <button class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </button>
        <h1 class="nav-title">本站管理员</h1>
      </div>
    </header>

    <div class="admin-cards">
      <div class="admin-card" v-for="admin in admins" :key="admin.name">
        <div class="admin-avatar">
          <img :src="admin.avatar" :alt="admin.name">
        </div>
        <div class="admin-info">
          <h2>{{ admin.name }}</h2>
          <p><el-icon><Message /></el-icon> {{ admin.email }}</p>
          <p><el-icon><Phone /></el-icon> {{ admin.phone }}</p>
          <p class="responsibility">
            <el-icon><Management /></el-icon> 
            <span>{{ admin.responsibility }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Message, Phone, Management } from '@element-plus/icons-vue'
import KJHAvatar from '@/assets/KJH.jpg'
import StaCivaFoxAvatar from '@/assets/StaCivaFox.jpg'
import FandaAvatar from '@/assets/Fanda.jpg'

export default {
  name: 'ContactUs',
  components: {
    ArrowLeft,
    Message,
    Phone,
    Management
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const admins = ref([
      {
        name: 'KJH',
        avatar: KJHAvatar,
        email: 'kjh@admin.com',
        phone: '123-4567-8901',
        responsibility: '用户管理与系统维护'
      },
      {
        name: 'StaCivaFox',
        avatar: StaCivaFoxAvatar,
        email: 'stacivafox@admin.com',
        phone: '123-4567-8902',
        responsibility: '商品审核与交易管理'
      },
      {
        name: 'Fanda',
        avatar: FandaAvatar,
        email: 'fanda@admin.com',
        phone: '123-4567-8903',
        responsibility: '投诉处理与平台运营'
      }
    ])

    const goBack = () => {
      router.go(-1)
    }

    return {
      admins,
      goBack
    }
  }
}
</script>

<style scoped>
.contact-us {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-header {
  background-color: #ff5000;
  padding: 15px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  position: relative;
}

.nav-title {
  color: white;
  margin: 0;
  flex: 1;
  text-align: center;
  font-size: 1.5em;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border: none;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.admin-cards {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 300px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 4px solid #ff5000;
}

.admin-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.admin-avatar {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  overflow: hidden;
  margin-bottom: 20px;
  border: 3px solid #ff5000;
  box-shadow: 0 4px 10px rgba(255, 80, 0, 0.2);
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-info {
  text-align: center;
  width: 100%;
}

.admin-info h2 {
  color: #ff5000;
  margin: 0 0 15px 0;
  font-size: 1.5em;
}

.admin-info p {
  color: #666;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.admin-info p:hover {
  background-color: #fff5f0;
}

.admin-info .el-icon {
  color: #ff5000;
  font-size: 1.2em;
}

.responsibility {
  background-color: #fff5f0;
  border: 1px solid #ffe0d0;
  margin-top: 15px !important;
}

.responsibility span {
  color: #ff5000;
  font-weight: 500;
}
</style> 