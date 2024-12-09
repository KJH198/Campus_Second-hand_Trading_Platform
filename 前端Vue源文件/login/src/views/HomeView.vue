<script>
import { onMounted, ref, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import defaultAvatar from '@/assets/tubiao.png'; // 导入默认头像图片
import lanqiuImage from '@/assets/lanqiu.png';  // 导入篮球图片
import xuexiImage from '@/assets/xuexi.png';
import shumaImage from '@/assets/shuma.png';
import yiwuImage from '@/assets/yifu.png';
import qitaImage from '@/assets/qita.png';
import { Search, Bell } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { ElDialog, ElMessage } from 'element-plus'

export default {
  name: "HomeView",
  components: {
    ElIcon,
    Search,
    ElDialog,
    Bell,
  },
  setup() {
    const route = useRoute();
    const phone_number = ref(route.query.phone_number);
    const user_id = ref(route.query.user_id);
    // console.log('Phone number:', phone_number.value);
    console.log("user_id",user_id.value);

    var products = ref([]);
    const searchQuery = ref('');
    const filteredProducts = ref([]);
    const dropdownVisible = ref(false);
    const userAvatar = ref('');
    const router = useRouter();
    const currentPage = ref(1);
    const pageSize = 16;  // 每页显示16个商品
    const noResultsMessage = ref('');
    const announcements = ref([]);
    const hasNewAnnouncement = ref(false);
    const lastCheckTime = ref(new Date().toISOString());
    let pollTimer = null;
    const showAnnouncementDialog = ref(false);
    const lastAnnouncementTime = ref(null);
    const showMessagesDialog = ref(false);
    const messages = ref([]);
    const selectedMessage = ref(null);
    const replyContent = ref('');
    const hasNewMessages = ref(false);
    let messageCheckTimer = null;

    function base64ToBlob(base64) {
      var byteCharacters = atob(base64);
      var byteArrays = [];
      for (var i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      var byteArray = new Uint8Array(byteArrays);
      return new Blob([byteArray], { type: 'image/jpeg' });
}

    // 计算当前页应该显示的商品
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return filteredProducts.value.slice(start, end);
    });

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / pageSize);
    });

    // 修改默认产品对象
    const defaultProduct = {
      goods_id: 0,
      goods_name: "默认商品",
      goods_price: "0.00",
      picture: defaultAvatar  // 改为 picture
    };

    /**
     * 请求商品接口上来就执行，希望获得随机商品数组。
     * data{
     * pro
     * }
     * @returns {Promise<void>}
     */
    async function fetchProducts() {
      try {
        const response = await fetch("/home", {
          method: "GET",
          headers: {
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("商品 before URL", data);
        //为每个商品的图片字符流创建URL
        data.goods.forEach(product => {
          console.log("商品图片", product.picture);
          if (product.picture !== null) {
            product.picture = URL.createObjectURL(base64ToBlob(product.picture));
          }
          //product.picture = URL.createObjectURL(dataURItoBlob(product.picture));
        });
        console.log("商品 after URL", data);
        products.value = data.goods;
        filteredProducts.value = data.goods;
      } catch (error) {
        console.error("加载商品失败", error);
        // 创建包含33个默认商品的数组，使用新的属性名
        const defaultProducts = Array(33).fill().map((_, index) => ({
          ...defaultProduct,
          goods_id: index + 1
        }));
        products.value = defaultProducts;
        filteredProducts.value = defaultProducts;
      }
    }

    /**
     * 请求用户头像接口，一上来就执行，希望获得用户头像。
     * data{
     * userAvatar
     * }
     * @returns {Promise<void>}
     */
    async function fetchUserAvatar() {
      try {
        const response = await fetch("/home", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type':"user_picture"
          },
          body: JSON.stringify({
            phone_number: phone_number.value, // 使用从路由获取的电话号码
            user_id: user_id.value
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user avatar');
        }
        const data = await response.blob();
        //console.log("用户头像", data.picture_url);
        userAvatar.value = URL.createObjectURL(data);
        console.log("用户头像", userAvatar);
      } catch (error) {
        console.error("加载用户头像失败", error);
        // 使用导入的默认图片作为头像
        userAvatar.value = defaultAvatar;
      }
    }

    /**
     * 搜索商品
     * data{
     * products[]
     * }
     */
    async function handleSearch() {
      if (!searchQuery.value.trim()) {
        filteredProducts.value = products.value;
        noResultsMessage.value = '';
        return;
      }
      try {
        const response = await fetch('/home', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'type': 'search'
          },
          body: JSON.stringify({
            query: searchQuery.value
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        
        // 检查返回的商品数组是否为空
        if (!data.goods || data.goods.length === 0) {
          filteredProducts.value = [];
          noResultsMessage.value = '抱歉找不到符合您描述要求的商品';
        } else {
          products.value = data.goods;
          filteredProducts.value = data.goods;
          noResultsMessage.value = '';
        }
        console.log("搜索结果", data);
      } catch (error) {
        console.error("搜索失败", error);
        noResultsMessage.value = '搜索失败，请稍后重试';
      }
    }

    function toggleDropdown() {
      dropdownVisible.value = !dropdownVisible.value;
      console.log('Dropdown visibility:', dropdownVisible.value);
    }

    function closeDropdown(event) {
      const userProfile = event.target.closest('.user-profile');
      if (!userProfile) {
        dropdownVisible.value = false;
      }
    }

    async function viewProfile() {
      try {
        // 获取用户信息
        const response = await fetch("/home", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': "user_info"
          },
          body: JSON.stringify({
            phone_number: phone_number.value,
            user_id: user_id.value
          })
        });

        if (!response.ok) throw new Error('获取用户信息失败');
        
        const userData = await response.json();
        
        // 通过路由导航时传递用户信息
        router.push({
          path: '/profile',
          query: {
            user_id: user_id.value,
            current_user_id: user_id.value,  // 添加这一行，因为查看自己的个人页面时，current_user_id 就是 user_id
            phone_number: phone_number.value,
            userAvatar: userAvatar.value
          },
          state: {
            userInfo: userData // 包含用户的详细信息
          }
        });
      } catch (error) {
        console.error("获取用户信息失败:", error);
        ElMessage.error('获取用户信息失败');
      }
    }

    function viewNotifications() {
      console.log("查看通知");
    }

    function viewMessages() {
      console.log("查看消息");
    }

    // 添加按类别获取商品的函数
    async function fetchProductsByCategory(category) {
      try {
        const response = await fetch("/home", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'category_search'
          },
          body: JSON.stringify({
            category_name: category
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products by category');
        }
        const data = await response.json();
        products.value = data.products;
        filteredProducts.value = data.products;
        currentPage.value = 1;  // 重置页码为第一页
      } catch (error) {
        console.error("加载分类商品失败", error);
        
        // 根据类别选择对应的默认图片
        let defaultImage;
        switch(category) {
          case 'sport':
            defaultImage = lanqiuImage;
            break;
          case 'study':
            defaultImage = xuexiImage;
            break;
          case 'digital':
            defaultImage = shumaImage;
            break;
          case 'cloth':
            defaultImage = yiwuImage;
            break;
          case 'else':
            defaultImage = qitaImage;
            break;
          default:
            defaultImage = defaultAvatar;
        }
        
        const defaultProducts = Array(33).fill().map((_, index) => ({
          ...defaultProduct,
          goods_id: index + 1,
          picture: defaultImage  // 改为 picture
        }));
        products.value = defaultProducts;
        filteredProducts.value = defaultProducts;
        currentPage.value = 1;  // 在错误处理中也重置页码
      }
    }

    // 修改跳转商品页函数
    function goToDetails(product) {
      console.log('跳转商品详情，商品数：', product);
      router.push({
        name: 'GoodDetails',  // 对应 router/index.js 中的路由名称
        params: { 
          productId: product.goods_id  // 路由参数
        },
        query: { 
          phone_number: phone_number.value,  // 添加电话号码
          user_id: user_id.value,           // 添加用户ID
          current_user_id: user_id.value,   // 添加当前登录者的ID
          picture: product.picture,         // 商品图片
          name: product.goods_name,         // 商品名称
          price: product.goods_price,       // 商品价格
          userAvatar: userAvatar.value      // 添加用户头像
        }
      }).then(() => {
        console.log('跳转成功');
      }).catch(err => {
        console.error('跳转失败：', err);
      });
    }

    // 添加页面切换函数
    function handlePageChange(page) {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 在 setup 函数中添加新的处理函数
    function contactUs() {
      console.log("联系我们");
    }

    // 获取公告函数
    async function fetchAnnouncements(event) {
      try {
        const response = await fetch("/home", {
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
        console.log("后端返回的公告数据:", data);
        announcements.value = data.announcements;
        
        // 如果有公告，找出最新的公告时间
        if (announcements.value && announcements.value.length > 0) {
          const latestTime = Math.max(...announcements.value.map(a => new Date(a.date).getTime()));
          
          if (event?.type === 'click') {
            lastAnnouncementTime.value = latestTime;
            hasNewAnnouncement.value = false;
            showAnnouncementDialog.value = true;
          } else {
            hasNewAnnouncement.value = !lastAnnouncementTime.value || latestTime > lastAnnouncementTime.value;
          }
          console.log("用户最后查看的公告时间为:"+lastAnnouncementTime.value +"当前公告最新时间为"+latestTime);
        }

      } catch (error) {
        console.error("获取公告失败", error);
        ElMessage.error('获取公告失败，请重试');
        announcements.value = [];
        
        if (event?.type === 'click') {
          showAnnouncementDialog.value = true;
        }
      }
    }

    // 开始轮询
    function startPolling() {
      pollTimer = setInterval(() => {
        fetchAnnouncements(); // 不传入事件参，表示是轮询触发的
      }, 10000); // 每10秒轮询一次
    }

    // 停止轮询
    function stopPolling() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    // 在 setup 中添加 formatDate 函数
    function formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // 查看消息
    async function viewMessages() {
      showMessagesDialog.value = true;
      await fetchMessages();
      hasNewMessages.value = false; // 清除新消息提示
    }

    // 获取消息列表
    async function fetchMessages() {
      try {
        const response = await fetch("/home", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'get_messages'
          },
          body: JSON.stringify({
            user_id: user_id.value
          })
        });

        if (!response.ok) throw new Error('获取消息失败');

        const data = await response.json();
        // 处理接收到的消息
        const receivedMessages = data.received_messages.map(msg => ({
          message_id: msg.message_id,
          content: msg.content,
          deliver_id: msg.deliver_id,
          receiver_id: msg.receiver_id,
          deliver_time: msg.deliver_time,  
          type: 'received',
          deliver_picture: msg.deliver_picture ? 
            URL.createObjectURL(base64ToBlob(msg.deliver_picture)) : 
            defaultAvatar,
          deliver_name: msg.deliver_name
        }));
        
        // 处理发送的消息
        const sentMessages = data.sent_messages.map(msg => ({
          message_id: msg.message_id,
          content: msg.content,
          deliver_id: msg.deliver_id,
          receiver_id: msg.receiver_id,
          deliver_time: msg.deliver_time,
          type: 'sent',
          receiver_picture: msg.receiver_picture ?
            URL.createObjectURL(base64ToBlob(msg.receiver_picture)) : 
            defaultAvatar,
          receiver_name: msg.receiver_name
        }));
        
        // 合并消息并按时间排序
        messages.value = [...receivedMessages, ...sentMessages].sort((a, b) => 
          new Date(b.deliver_time) - new Date(a.deliver_time)
        );

      } catch (error) {
        console.error('Error fetching messages:', error);
        ElMessage.error('获取消息失败');
      }
    }

    // 检查新消息
    async function checkNewMessages() {
      try {
        const response = await fetch("/home", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'check_new_messages'
          },
          body: JSON.stringify({
            user_id: user_id.value
          })
        });

        if (!response.ok) throw new Error('检查新消息失败');

        const data = await response.json();
        if (data.has_new) {
          hasNewMessages.value = true;
        }
      } catch (error) {
        console.error('Error checking messages:', error);
      }
    }

    // 选择消息
    function selectMessage(message) {
      selectedMessage.value = message;
    }

    // 发送回复
    async function sendReply() {
      if (!replyContent.value.trim()) {
        ElMessage.warning('请输入回复内容');
        return;
      }

      try {
        const response = await fetch("/home", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'send_message'
          },
          body: JSON.stringify({
            deliver_id: user_id.value,
            receiver_id: selectedMessage.value.deliver_id,
            content: replyContent.value
          })
        });

        if (!response.ok) throw new Error('发送回复失败');

        const data = await response.json();
        if (data.success) {
          ElMessage.success('回复发送成功');
          replyContent.value = '';
          selectedMessage.value = null;
          await fetchMessages(); // 刷新消息列表
        }
      } catch (error) {
        console.error('Error sending reply:', error);
        ElMessage.error('发送回复失败');
      }
    }

    // 格式化消息时间
    function formatMessageTime(time) {
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      
      return date.toLocaleDateString();
    }

    onMounted(() => {
      fetchProducts();
      fetchUserAvatar();
      document.addEventListener('click', closeDropdown);
      fetchAnnouncements(); // 立即获取一次
      startPolling(); // 开始轮询
      messageCheckTimer = setInterval(checkNewMessages, 10000); // 每10秒检查一次新消息
    });

    onUnmounted(() => {
      stopPolling();
      if (messageCheckTimer) {
        clearInterval(messageCheckTimer);
      }
    });

    return {
      filteredProducts,
      searchQuery,
      handleSearch,
      dropdownVisible,
      toggleDropdown,
      viewProfile,
      viewNotifications,
      viewMessages,
      userAvatar,
      fetchProductsByCategory,
      goToDetails,
      paginatedProducts,
      currentPage,
      totalPages,
      handlePageChange,
      contactUs,  // 添加新函数
      announcements,
      hasNewAnnouncement,
      fetchAnnouncements,
      noResultsMessage,
      showAnnouncementDialog,
      formatDate,  // 添加这一行
      showMessagesDialog,
      messages,
      selectedMessage,
      replyContent,
      selectMessage,
      sendReply,
      formatMessageTime,
      checkNewMessages,
      hasNewMessages
    };
  },
};
</script>

<template>
  <div class="home-view">
    <header class="header">
      <div class="nav-container">
        <div class="welcome-text">欢迎使用二手交易平台</div>
        <div class="search-container">
          <div class="search-wrapper">
            <el-icon class="search-icon"><Search /></el-icon>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="搜索商品" 
              class="search-bar" 
            />
            <button class="search-button" @click="handleSearch">
              <el-icon><Search /></el-icon>
            </button>
          </div>
        </div>
        
        <div class="user-section">
          <button class="announcement-btn" @click="fetchAnnouncements">
            <el-icon><Bell /></el-icon>
            <span v-if="hasNewAnnouncement" class="new-notice-dot"></span>
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
              <button @click="viewMessages" class="message-btn">
                我的消息
                <span v-if="hasNewMessages" class="message-badge"></span>
              </button>
              <button @click="contactUs">联系我们</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="category-buttons">
        <button @click="fetchProductsByCategory('sport')">体育运动</button>
        <button @click="fetchProductsByCategory('study')">学习用品</button>
        <button @click="fetchProductsByCategory('digital')">电子数码</button>
        <button @click="fetchProductsByCategory('cloth')">衣物饰品</button>
        <button @click="fetchProductsByCategory('else')">其他类别</button>
      </div>

      <section class="product-grid">
        <div v-if="noResultsMessage" class="no-results-message">
          {{ noResultsMessage }}
        </div>
        <div 
          v-else
          v-for="product in paginatedProducts" 
          :key="product.goods_id" 
          class="product-card"
          @click="goToDetails(product)"
        >
          <div class="product-image">
            <img :src="product.picture" :alt="product.goods_name" />
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.goods_name }}</h3>
            <p class="product-price">¥{{ product.goods_price }}</p>
          </div>
        </div>
      </section>

      <!-- 添加分页控件 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-button"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-button"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </main>

    <el-dialog
      v-model="showAnnouncementDialog"
      title="系统公告"
      width="50%"
    >
      <div class="announcements-container">
        <div v-if="announcements && announcements.length > 0">
          <div v-for="announcement in announcements" 
               :key="announcement.id" 
               class="announcement-item"
          >
            <h3>{{ announcement.title }}</h3>
            <p>{{ announcement.content }}</p>
            <span class="announcement-date">{{ formatDate(announcement.date) }}</span>
          </div>
        </div>
        <div v-else class="no-announcement">
          暂时没有新的公告
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showMessagesDialog"
      title="我的消息"
      width="60%"
    >
      <div class="messages-container">
        <div class="messages-list">
          <div 
            v-for="message in messages" 
            :key="message.message_id"
            class="message-item"
            :class="{ 
              'selected': selectedMessage === message,
              'sent-message': message.type === 'sent',
              'received-message': message.type === 'received'
            }"
            @click="selectMessage(message)"
          >
            <div class="message-header">
              <img :src="message.deliver_picture" class="sender-avatar" />
              <span class="sender-name">
                {{ message.type === 'sent' ? 
                  `发送给: ${message.receiver_name}` : 
                  `来自: ${message.deliver_name}` 
                }}
              </span>
              <span class="message-time">{{ formatMessageTime(message.deliver_time) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>
        
        <div v-if="selectedMessage" class="reply-section">
          <div class="selected-message">
            <div class="reply-to">回复给: {{ selectedMessage.deliver_name }}</div>
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="4"
              placeholder="输入回复内容..."
            />
            <div class="reply-actions">
              <el-button @click="selectedMessage = null">取消回复</el-button>
              <el-button type="primary" @click="sendReply">发送回复</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.home-view {
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
  justify-content: flex-start;
  gap: 40px;
}

.welcome-text {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  min-width: 200px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;

  flex: 1;
  max-width: 500px;
}

.search-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  font-size: 18px;
}

.search-bar {
  width: 100%;
  padding: 8px 40px 8px 40px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  background: #fff;
}

.search-button {
  position: absolute;
  right: 5px;
  padding: 6px 15px;
  background-color: #ff5000;
  border: none;
  border-radius: 15px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #ff6a00;
}

.search-button .el-icon {
  font-size: 16px;
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
  display: block;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  z-index: 1001;
  min-width: 150px;
  margin-top: 8px;
  border: 1px solid #eee;
  display: block;
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
  white-space: nowrap;
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  margin: 0;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.product-price {
  margin: 10px 0 0;
  color: #ff5000;
  font-size: 18px;
  font-weight: bold;
}

.category-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.category-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #ff5000;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.category-buttons button:hover {
  background-color: #ff6a00;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-bottom: 30px;
}

.page-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #ff5000;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-button:hover:not(:disabled) {
  background-color: #ff6a00;
}

.page-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 16px;
  color: #666;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
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
  position: relative;
}

.announcement-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.announcement-btn .el-icon {
  font-size: 20px;
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
  font-size: 16px;
}

.announcement-item p {
  margin: 0 0 8px 0;
  color: #666;
  line-height: 1.5;
}

.announcement-date {
  font-size: 12px;
  color: #999;
}

.no-results-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.new-notice-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #44ff6d;
  border-radius: 50%;
  border: 2px solid #fff;
}

.no-announcement {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  height: 400px;
  overflow-y: auto;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
}

.message-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.message-item:last-child {
  border-bottom: none;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.sender-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.sender-name {
  font-weight: bold;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.message-content {
  margin-top: 5px;
}

.reply-section {
  margin-top: 10px;
}

.selected-message {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.reply-to {
  font-weight: bold;
  margin-bottom: 5px;
}

.reply-actions {
  margin-top: 10px;
}

.reply-actions .el-button {
  margin-right: 10px;
}

.message-btn {
  position: relative;
}

.message-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 8px;
  height: 8px;
  background-color: #ff5000;
  border-radius: 50%;
}

.messages-container {
  display: flex;
  gap: 20px;
  height: 500px;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.message-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: #f5f5f5;
}

.message-item.selected {
  background-color: #f0f7ff;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.sender-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.sender-name {
  font-weight: bold;
}

.message-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.message-content {
  color: #666;
  line-height: 1.5;
}

.reply-section {
  flex: 1;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
}

.reply-to {
  margin-bottom: 10px;
  font-weight: bold;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.sent-message {
  background-color: #f0f7ff;
  margin-left: 20px;
  border-left: 3px solid #409eff;
}

.received-message {
  background-color: #f5f5f5;
  margin-right: 20px;
  border-left: 3px solid #67c23a;
}

.sent-message .sender-name,
.received-message .sender-name {
  font-size: 14px;
  color: #666;
}

.sent-message .message-content {
  color: #409eff;
}

.received-message .message-content {
  color: #67c23a;
}
</style>
