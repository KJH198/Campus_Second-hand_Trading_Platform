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
          <img :src="productImage" :alt="productName" />
        </div>
        <div class="product-info">
          <h1 class="product-name">{{ productName }}</h1>
          <div class="product-price">¥{{ productPrice }}</div>
          <div class="product-id">商品编号：{{ productId }}</div>
          
          <!-- 卖家信息 -->
          <div class="seller-info">
            <div class="seller-avatar">
              <img :src="sellerAvatar" alt="卖家头像" />
            </div>
            <div class="seller-details">
              <div class="seller-name">{{ sellerName }}</div>
              <div class="seller-contact">联系方式：{{ sellerContact }}</div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button class="contact-btn" @click="contactSeller">联系卖家</button>
            <button class="favorite-btn" @click="toggleFavorite">
              {{ isFavorite ? '取消收藏' : '收藏商品' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="product-description">
        <h2>商品描述</h2>
        <p>{{ productDescription }}</p>
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
import { Bell } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { ElDialog } from 'element-plus';

export default {
  name: 'GoodDetails',
  components: {
    ElIcon,
    Bell,
    ElDialog,
  },
  setup() {
    const route = useRoute();
    const userAvatar = ref('');
    const dropdownVisible = ref(false);
    const announcements = ref([]);
    const showAnnouncementDialog = ref(false);
    const productId = ref(route.params.productId);
    const productImage = ref(route.query.image);
    const productName = ref(route.query.name);
    const productPrice = ref(route.query.price);
    const sellerAvatar = ref('');
    const sellerName = ref('');
    const sellerContact = ref('');
    const productDescription = ref('');
    const isFavorite = ref(false);
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
          { id: 1, title: "系统提示", content: "暂时没有新的公告", date: new Date().toLocaleDateString() }
        ];
        showAnnouncementDialog.value = true;
      }
    }

    // 获取商品详细信息
    async function fetchProductDetails() {
      try {
        const response = await fetch(`/product/${route.params.productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch product details');
        
        const data = await response.json();
        sellerAvatar.value = data.sellerAvatar;
        sellerName.value = data.sellerName;
        sellerContact.value = data.sellerContact;
        productDescription.value = data.description;
      } catch (error) {
        console.error('Error fetching product details:', error);
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

    // 在 setup 函数中添加获取商品详情的函数
    async function fetchGoodsDetail() {
      try {
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

        if (!response.ok) {
          throw new Error('Failed to fetch goods detail');
        }

        const data = await response.json();
        // 更新商品详情数据
        productName.value = data.goods_name;
        productPrice.value = data.goods_price;
        productImage.value = data.goods_image;
        productDescription.value = data.goods_description;
        sellerName.value = data.seller_name;
        sellerContact.value = data.seller_phone;
        sellerAvatar.value = data.seller_avatar;
        comments.value = data.comments || [];
        isFavorite.value = data.is_favorite;
      } catch (error) {
        console.error('Error fetching goods detail:', error);
      }
    }

    onMounted(() => {
      fetchUserAvatar();
      document.addEventListener('click', closeDropdown);
      fetchGoodsDetail();  // 添加这行
      // fetchProductDetails(); // 移除这行，因为已经被新函数替代
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
      productImage,
      productName,
      productPrice,
      sellerAvatar,
      sellerName,
      sellerContact,
      productDescription,
      isFavorite,
      newComment,
      comments,
      submitComment,
      contactSeller,
      toggleFavorite
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
  overflow: hidden;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.product-id {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
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
  background: #ff5000;
  color: white;
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