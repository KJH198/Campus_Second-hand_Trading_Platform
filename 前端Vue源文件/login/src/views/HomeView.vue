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

    onMounted(() => {
      fetchProducts();
      fetchUserAvatar();
      document.addEventListener('click', closeDropdown);
      fetchAnnouncements(); // 立即获取一次
      startPolling(); // 开始轮询
    });

    onUnmounted(() => {
      stopPolling();
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
              <button @click="viewMessages">我的消息</button>
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
</style>
