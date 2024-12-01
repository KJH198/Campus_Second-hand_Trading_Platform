<template>
  <div class="details-view">
    <header class="header">
      <div class="nav-container">
        <div class="welcome-text">欢迎使用二手交易平台</div>
        
        <div class="user-section">
          <button class="announcement-btn" @click="fetchAnnouncements">
            <el-icon><Bell /></el-icon>
          </button>
          
          <div class="user-profile">
            <img 
              :src="userAvatar" 
              alt="用户头像" 
              class="avatar" 
              @click.stop="toggleDropdown"
            />
            <div 
              v-show="dropdownVisible" 
              class="dropdown-menu"
            >
              <button @click="viewProfile">个人信息</button>
              <button @click="viewNotifications">我的通知</button>
              <button @click="viewMessages">我的消息</button>
              <button @click="contactUs">联系我们</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 商品详情内容 -->
    <main class="main-content">
      <div class="product-details">
        <div class="product-image">
          <div v-if="!goodsPictures.length" style="color: red;">
            没有图片可显示
          </div>
          
          <button 
            class="arrow-button left" 
            @click="prevImage" 
            :disabled="currentImageIndex === 0"
          >
            <el-icon><ArrowLeft /></el-icon>
          </button>
          
          <img 
            v-if="goodsPictures.length > 0"
            :src="goodsPictures[currentImageIndex]" 
            :alt="goodsName" 
          />
          
          <div style="position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.5); color: white; padding: 5px;">
            图片数量: {{ goodsPictures.length }}
            当前索引: {{ currentImageIndex }}
          </div>
          
          <button 
            class="arrow-button right" 
            @click="nextImage" 
            :disabled="currentImageIndex === goodsPictures.length - 1"
          >
            <el-icon><ArrowRight /></el-icon>
          </button>
          
          <div class="image-indicators" v-if="goodsPictures.length > 1">
            <span 
              v-for="(_, index) in goodsPictures" 
              :key="index"
              :class="['indicator', { active: index === currentImageIndex }]"
              @click="currentImageIndex = index"
            ></span>
          </div>
        </div>
        <div class="product-info">
          <h1 class="product-name">{{ goodsName }}</h1>
          <div class="product-price">¥{{ goodsPrice }}</div>
          <div class="product-meta">
            <div class="meta-item heat">
              <el-icon><Star /></el-icon>
              <span class="meta-label">热度</span>
              <span class="meta-value">{{ heat }}</span>
              <div class="heat-bar">
                <div class="heat-progress" :style="{ width: `${Math.min(heat/10, 100)}%` }"></div>
              </div>
            </div>
            <div class="meta-item begin-time">
              <el-icon><Calendar /></el-icon>
              <span class="meta-label">上架时间</span>
              <span class="meta-value">{{ formatDate(beginTime) }}</span>
            </div>
          </div>
          
          <!-- 卖家信息 -->
          <div class="seller-info">
            <div class="seller-avatar">
              <img :src="sellerPicture" alt="卖家头像" />
            </div>
            <div class="seller-details">
              <div class="seller-name">{{ sellerName }}</div>
              <button class="contact-btn" @click="contactSeller">
                <el-icon><Phone /></el-icon>
                <span>联系卖家</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="product-description">
        <h2>品描述</h2>
        <p>{{ goodsDescription }}</p>
      </div>

      <!-- 讨论区 -->
      <div class="discussion-section">
        <h2>讨论区</h2>
        
        <!-- 发表评论 -->
        <div class="comment-input">
          <textarea 
            v-model="newComment" 
            placeholder="说点什么..."
            rows="3"
          ></textarea>
          <button @click="submitComment">发表评论</button>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-for="comment in comments" 
               :key="comment.id" 
               class="comment-item"
          >
            <div class="comment-user">
              <img :src="comment.userAvatar" :alt="comment.userName" />
              <span class="user-name">{{ comment.userName }}</span>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
      </div>
    </main>

    <!-- 公告弹窗 -->
    <el-dialog
      v-model="showAnnouncementDialog"
      title="系统公告"
      width="50%"
    >
      <div class="announcements-container">
        <div v-for="announcement in announcements" 
             :key="announcement.id" 
             class="announcement-item"
        >
          <h3>{{ announcement.title }}</h3>
          <p>{{ announcement.content }}</p>
          <span class="announcement-date">{{ announcement.date }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import defaultAvatar from '@/assets/tubiao.png';
import lanqiuImage from '@/assets/lanqiu.png';
import xuexiImage from '@/assets/xuexi.png';
import shumaImage from '@/assets/shuma.png';
import yiwuImage from '@/assets/yifu.png';
import qitaImage from '@/assets/qita.png';
import { Bell, ArrowLeft, ArrowRight, Star, Calendar, Phone } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { ElDialog } from 'element-plus';

export default {
  name: 'GoodDetails',
  components: {
    ElIcon,
    Bell,
    ArrowLeft,
    ArrowRight,
    Star,
    Calendar,
    Phone,
    ElDialog,
  },
  setup() {
    const route = useRoute();
    const userAvatar = ref('');
    const dropdownVisible = ref(false);
    const announcements = ref([]);
    const showAnnouncementDialog = ref(false);
    const productId = ref(route.params.productId);
    const goodsPictures = ref([]);
    const currentImageIndex = ref(0);
    const goodsName = ref(route.query.name);
    const goodsPrice = ref(route.query.price);
    const sellerPicture = ref('');
    const sellerName = ref('');
    const goodsDescription = ref('');
    const heat = ref(0);
    const beginTime = ref('');
    const newComment = ref('');
    const comments = ref([]);

    // 获取用户头像
    async function fetchUserAvatar() {
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'avatar'
          },
          body: JSON.stringify({
            phone_number: route.query.phone_number
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user avatar');
        }
        const data = await response.json();
        userAvatar.value = data.userAvatar;
      } catch (error) {
        console.error("加载用户头像失败", error);
        userAvatar.value = defaultAvatar;
      }
    }

    // 下拉菜单相关函数
    function toggleDropdown() {
      dropdownVisible.value = !dropdownVisible.value;
    }

    function closeDropdown(event) {
      const userProfile = event.target.closest('.user-profile');
      if (!userProfile) {
        dropdownVisible.value = false;
      }
    }

    function viewProfile() {
      console.log("查看个人信息");
    }

    function viewNotifications() {
      console.log("查看通知");
    }

    function viewMessages() {
      console.log("查看消息");
    }

    function contactUs() {
      console.log("联系我们");
    }

    // 获取公告
    async function fetchAnnouncements() {
      try {
        const response = await fetch("/goods_detail", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'type': 'announcement'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }
        const data = await response.json();
        announcements.value = data.announcements;
        showAnnouncementDialog.value = true;
      } catch (error) {
        console.error("获取公告失败", error);
        announcements.value = [
          { id: 1, title: "系统提示", content: "暂时没有新���公告", date: new Date().toLocaleDateString() }
        ];
        showAnnouncementDialog.value = true;
      }
    }

    // 获取评论
    async function fetchComments() {
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'comments'
          },
          body: JSON.stringify({
            goods_id: route.params.productId
          })
        });
        
        if (!response.ok) throw new Error('Failed to fetch comments');
        
        const data = await response.json();
        comments.value = data.comments;
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }

    // 提交评论
    async function submitComment() {
      if (!newComment.value.trim()) return;
      
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'add_comment'
          },
          body: JSON.stringify({
            goods_id: route.params.productId,
            content: newComment.value
          })
        });
        
        if (!response.ok) throw new Error('Failed to submit comment');
        
        await fetchComments(); // 重新获取评论列表
        newComment.value = ''; // 清空输入框
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }

    function contactSeller() {
      // 实现联系卖家的逻辑
      console.log('联系卖家');
    }

    async function toggleFavorite() {
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'favorite'
          },
          body: JSON.stringify({
            goods_id: route.params.productId
          })
        });
        
        if (!response.ok) throw new Error('Failed to toggle favorite');
        
        isFavorite.value = !isFavorite.value;
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    }

    // 在 setup() 函数中添加获取商品详情的函数
    async function fetchGoodsDetail() {
      console.log("开始获取商品详情");
      try {
        console.log("发送请求，商品ID:", route.params.productId);
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'detail'
          },
          body: JSON.stringify({
            goods_id: route.params.productId
          })
        });

        console.log("收到响应:", response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch goods detail');
        }

        const data = await response.json();
        console.log("获取到的商品详情数据：", data);

        // 处理卖家头像
        if (data.seller_picture) {
          sellerPicture.value = URL.createObjectURL(base64ToBlob(data.seller_picture));
        }

        // 处理商品图片数组
        if (Array.isArray(data.goods_pictures)) {
          goodsPictures.value = data.goods_pictures.map(imageData => {
            return URL.createObjectURL(base64ToBlob(imageData));
          });
        }
        
        // 更新其他商品详情数据
        goodsName.value = data.goods_name;
        goodsPrice.value = data.goods_price;
        goodsDescription.value = data.goods_description;
        sellerName.value = data.seller_name;
        heat.value = data.heat;
        beginTime.value = data.begin_time;

      } catch (error) {
        console.log("进入错误处理分支");
        console.error('Error fetching goods detail:', error);
        console.log("开始设置默认数据");
        
        // 确保设置默认图片数组
        goodsPictures.value = [
          lanqiuImage,
          xuexiImage,
          shumaImage,
          yiwuImage,
          qitaImage
        ];
        console.log("默认图片数组已设置，长度:", goodsPictures.value.length);
        console.log("默认图片路径:", goodsPictures.value);
        
        // 设置其他默认数据
        goodsName.value = route.query.name || '测试商品';
        goodsPrice.value = route.query.price || '99.99';
        goodsDescription.value = '这是一个测试商品描述，用于调试多图片展示效果。';
        sellerName.value = '测试卖家';
        sellerPicture.value = defaultAvatar;
        
        // 生成随机热度（50-1000之间）
        heat.value = Math.floor(Math.random() * 951) + 50;
        console.log("默认热度值:", heat.value);
        
        // 生成最近7天内的随机日期
        const today = new Date();
        const randomDays = Math.floor(Math.random() * 7);
        today.setDate(today.getDate() - randomDays);
        beginTime.value = today.toISOString().split('T')[0];
        console.log("默认上架时间:", beginTime.value);

        // 设置默认评论
        comments.value = [
          {
            id: 1,
            userAvatar: defaultAvatar,
            userName: '测试用户1',
            time: '2024-03-20 10:00',
            content: '这是一条测试评论'
          },
          {
            id: 2,
            userAvatar: defaultAvatar,
            userName: '测试用户2',
            time: '2024-03-20 11:00',
            content: '这是另一条测试评论'
          }
        ];
        console.log("默认数据设置完成");
      }
    }

    function base64ToBlob(base64) {
      var byteCharacters = atob(base64);
      var byteArrays = [];
      for (var i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      var byteArray = new Uint8Array(byteArrays);
      return new Blob([byteArray], { type: 'image/jpeg' });
    }

    function nextImage() {
      if (currentImageIndex.value < goodsPictures.value.length - 1) {
        currentImageIndex.value++;
      }
    }

    function prevImage() {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
      }
    }

    // 添加日期格式化函数
    function formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        return '今天上架';
      } else if (days === 1) {
        return '昨天上架';
      } else if (days < 7) {
        return `${days}天前上架`;
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }

    onMounted(() => {
      console.log("组件已挂载");
      fetchUserAvatar();
      document.addEventListener('click', closeDropdown);
      console.log("开始调用 fetchGoodsDetail");
      fetchGoodsDetail();
      fetchComments();
    });

    return {
      userAvatar,
      dropdownVisible,
      toggleDropdown,
      viewProfile,
      viewNotifications,
      viewMessages,
      contactUs,
      announcements,
      showAnnouncementDialog,
      fetchAnnouncements,
      productId,
      goodsPictures,
      currentImageIndex,
      nextImage,
      prevImage,
      goodsName,
      goodsPrice,
      sellerPicture,
      sellerName,
      goodsDescription,
      heat,
      beginTime,
      newComment,
      comments,
      submitComment,
      contactSeller,
      toggleFavorite,
      formatDate,
    };
  }
};
</script>

<style scoped>
.details-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #ff5000;
  padding: 10px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.welcome-text {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.announcement-btn {
  padding: 8px;
  background: transparent;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  width: 36px;
  height: 36px;
}

.announcement-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-profile {
  position: relative;
  z-index: 1000;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #fff;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  min-width: 150px;
  margin-top: 8px;
  border: 1px solid #eee;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.dropdown-menu button:hover {
  background-color: #f5f5f5;
}

.dropdown-menu button:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.main-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.announcements-container {
  max-height: 400px;
  overflow-y: auto;
}

.announcement-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-item h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.announcement-item p {
  margin: 0 0 8px 0;
  color: #666;
}

.announcement-date {
  font-size: 12px;
  color: #999;
}

.product-details {
  display: flex;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  flex: 0 0 500px;
  height: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.arrow-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: white;
  padding: 15px 10px;
  cursor: pointer;
  z-index: 2;
  transition: background-color 0.3s;
}

.arrow-button:hover {
  background: rgba(0, 0, 0, 0.5);
}

.arrow-button:disabled {
  background: rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
}

.arrow-button.left {
  left: 0;
  border-radius: 0 4px 4px 0;
}

.arrow-button.right {
  right: 0;
  border-radius: 4px 0 0 4px;
}

.image-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;
}

.indicator.active {
  background: white;
}

.product-info {
  flex: 1;
  padding: 20px 0;
}

.product-name {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.product-price {
  font-size: 32px;
  color: #ff5000;
  font-weight: bold;
  margin-bottom: 20px;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.meta-item .el-icon {
  font-size: 20px;
  color: #ff5000;
}

.meta-label {
  color: #666;
  font-size: 14px;
  min-width: 60px;
}

.meta-value {
  color: #333;
  font-weight: 500;
}

.heat {
  position: relative;
}

.heat-bar {
  flex: 1;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-left: 10px;
}

.heat-progress {
  height: 100%;
  background: linear-gradient(90deg, #ff9000, #ff5000);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.begin-time {
  transition: transform 0.2s ease;
}

.begin-time:hover {
  transform: translateX(5px);
}

/* 添加动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.heat .meta-value {
  animation: pulse 2s infinite;
  color: #ff5000;
  font-weight: bold;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
}

.seller-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.seller-details {
  flex: 1;
}

.seller-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.action-buttons button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff6a00, #ff5000);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 80, 0, 0.2);
  margin-top: 8px;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 80, 0, 0.3);
  background: linear-gradient(135deg, #ff7a00, #ff6000);
}

.contact-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(255, 80, 0, 0.2);
}

.contact-btn .el-icon {
  font-size: 18px;
  animation: swing 1s ease-in-out infinite;
}

@keyframes swing {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.contact-btn span {
  font-size: 14px;
}

.favorite-btn {
  background: #fff;
  border: 1px solid #ff5000;
  color: #ff5000;
}

.product-description {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.discussion-section {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-input {
  margin: 20px 0;
}

.comment-input textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 10px;
}

.comment-input button {
  padding: 8px 20px;
  background: #ff5000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comments-list {
  margin-top: 20px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.comment-user img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.comment-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.comment-content {
  color: #333;
  line-height: 1.5;
}
</style> 