<template>
  <div class="manager-view">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="nav-container">
        <div class="welcome-text">管理员控制台</div>
        
        <div class="user-section">
          <div class="user-profile">
            <img 
              :src="adminAvatar" 
              alt="管理员头像" 
              class="avatar" 
              @click.stop="toggleDropdown"
            />
            <div 
              v-show="dropdownVisible" 
              class="dropdown-menu"
              @click.stop
            >
              <el-button text @click="viewProfile">个人信息</el-button>
              <el-button text @click="viewNotifications">系统通知</el-button>
              <el-button text @click="contactUs">联系我们</el-button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 侧边导航栏 -->
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="announcement">
            <el-icon><Promotion /></el-icon>
            <span>发布公告</span>
          </el-menu-item>
          
          <el-menu-item index="reports">
            <el-icon><Warning /></el-icon>
            <span>处理举报</span>
          </el-menu-item>
          
          <el-menu-item index="users">
            <el-icon><UserFilled /></el-icon>
            <span>用户封禁</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 内容展示区域 -->
      <el-main class="content">
        <el-card class="section" v-if="activeMenu === 'announcement'">
          <template #header>
            <div class="section-header">
              <h2>发布公告</h2>
              <el-button 
                type="primary" 
                class="publish-btn"
                @click="showPublishDialog = true"
              >
                <el-icon><Plus /></el-icon>
                发布新的公告
              </el-button>
            </div>
          </template>
          
          <!-- 公告列表 -->
          <div class="announce-list">
            <el-timeline>
              <el-timeline-item
                v-for="announce in announces"
                :key="announce.announce_id"
                :timestamp="formatDate(announce.deliver_time)"
                placement="top"
              >
                <el-card class="announce-card">
                  <template #header>
                    <div class="announce-header">
                      <h3>{{ announce.title }}</h3>
                      <el-button 
                        type="danger" 
                        size="small"
                        @click="handleDeleteAnnounce(announce.announce_id)"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </div>
                  </template>
                  <p class="announce-content">{{ announce.content }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
        
        <el-card class="section" v-if="activeMenu === 'reports'">
          <template #header>
            <h2>处理举报</h2>
          </template>
          
          <el-table :data="accusations" style="width: 100%">
            <el-table-column prop="accusation_id" label="举报ID" width="100" />
            <el-table-column prop="accuser_id" label="举报人ID" width="100" />
            <el-table-column prop="content" label="举报内容" show-overflow-tooltip />
            <el-table-column label="举报类型" width="120">
              <template #default="scope">
                {{ getAccusationType(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column label="被举报对象" width="120">
              <template #default="scope">
                {{ getAccusedTarget(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small"
                  @click="handleAccusation(scope.row)"
                >
                  处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <el-card class="section" v-if="activeMenu === 'users'">
          <template #header>
            <h2>用户封禁</h2>
          </template>
          
          <!-- 添加搜索区域 -->
          <div class="search-area">
            <el-input
              v-model="searchUserId"
              placeholder="请输入用户ID"
              class="search-input"
            >
              <template #append>
                <el-button @click="searchUser">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>

          <!-- 用户信息展示区域 -->
          <div v-if="userInfo" class="user-info-card">
            <el-card>
              <div class="user-info-content">
                <div class="user-avatar">
                  <img :src="userAvatarUrl" alt="用户头像">
                </div>
                <div class="user-details">
                  <div class="info-row">
                    <span class="label">用户名：</span>
                    <span class="value">{{ userInfo.user_name }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">手机号：</span>
                    <span class="value">{{ userInfo.phone_number }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">个人简介：</span>
                    <span class="value">{{ userInfo.other_information || '暂无简介' }}</span>
                  </div>
                </div>
                <div class="ban-action">
                  <el-button 
                    :type="userInfo.isbanned ? 'info' : 'danger'"
                    :disabled="userInfo.isbanned"
                  >
                    {{ userInfo.isbanned ? '已封禁' : '封禁' }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-main>
    </div>

    <!-- 添加发布公告的对话框 -->
    <el-dialog
      v-model="showPublishDialog"
      title="发布新公告"
      width="50%"
      :before-close="handleCloseDialog"
    >
      <el-form 
        :model="announceForm"
        :rules="announceRules"
        ref="announceFormRef"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="announceForm.title"
            placeholder="请输入公告标题"
          />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="announceForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取消发布</el-button>
          <el-button type="primary" @click="submitAnnouncement">
            确认发布
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import defaultAvatar from '@/assets/tubiao.png';
import { 
  Promotion, 
  Warning, 
  UserFilled,
  Plus,  // 添加 Plus 图标
  Search,  // 添加 Search 图标
  Delete  // 添加 Delete 图标
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'Manager',
  components: {
    Promotion,
    Warning,
    UserFilled,
    Plus,
    Search,
    Delete
  },
  
  setup() {
    const route = useRoute();
    
    const adminAvatar = ref(defaultAvatar);
    const adminName = ref(route.query.admin_name);
    
    const dropdownVisible = ref(false);
    const activeMenu = ref('announcement');

    // 添加公告相关的响应式变量
    const showPublishDialog = ref(false);
    const announceFormRef = ref(null);
    const announceForm = ref({
      title: '',
      content: ''
    });

    // 表单验证规则
    const announceRules = {
      title: [
        { required: true, message: '请输入公告标题', trigger: 'blur' },
        { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入公告内容', trigger: 'blur' },
        { min: 10, message: '内容不能少于 10 个字符', trigger: 'blur' }
      ]
    };

    // 添加用户搜索相关的响应式变量
    const searchUserId = ref('');
    const userInfo = ref(null);
    const userAvatarUrl = ref('');

    // 添加公告和举报相关的响应式变量
    const announces = ref([]);
    const accusations = ref([]);

    function toggleDropdown() {
      dropdownVisible.value = !dropdownVisible.value;
    }

    function closeDropdown(event) {
      if (!event.target.closest('.user-profile')) {
        dropdownVisible.value = false;
      }
    }

    function handleMenuSelect(index) {
      activeMenu.value = index;
    }

    function viewProfile() {
      console.log("查看个人信息");
    }

    function viewNotifications() {
      console.log("查看通知");
    }

    function contactUs() {
      console.log("联系我们");
    }

    // 关闭对话框
    function handleCloseDialog() {
      announceFormRef.value?.resetFields();
      showPublishDialog.value = false;
    }

    // 提交公告
    async function submitAnnouncement() {
      if (!announceFormRef.value) return;
      
      try {
        await announceFormRef.value.validate();
        
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'create_announce'
          },
          body: JSON.stringify({
            manger_name: adminName.value,
            title: announceForm.value.title,
            content: announceForm.value.content
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('公告发布成功！');
          handleCloseDialog();
        } else {
          ElMessage.error('公告发布失败，请重试');
        }
      } catch (error) {
        console.error('Error publishing announcement:', error);
        ElMessage.error('发布失败，请稍后重试');
      }
    }

    // 搜索用户函数
    async function searchUser() {
      if (!searchUserId.value) {
        ElMessage.warning('请输入用户ID');
        return;
      }

      try {
        const response = await fetch("/manager", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'search_user'
          },
          body: JSON.stringify({
            user_id: parseInt(searchUserId.value)
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // 处理用户头像
        if (data.picture) {
          const blob = base64ToBlob(data.picture);
          userAvatarUrl.value = URL.createObjectURL(blob);
        }
        
        userInfo.value = data;
        
      } catch (error) {
        console.error('Error searching user:', error);
        ElMessage.error('搜索用户失败，请重试');
      }
    }

    // Base64 转 Blob 函数
    function base64ToBlob(base64) {
      const byteCharacters = atob(base64);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const byteArray = new Uint8Array(byteArrays);
      return new Blob([byteArray], { type: 'image/jpeg' });
    }

    // 获取管理员页面信息
    async function fetchManagerInfo() {
      try {
        const response = await fetch("/manager", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'getinfo'
          },
          body: JSON.stringify({
            manager_name: adminName.value
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        announces.value = data.announces;
        accusations.value = data.accusations;
        
      } catch (error) {
        console.error('Error fetching manager info:', error);
        ElMessage.error('获取信息失败，请重试');
      }
    }

    // 格式化日期
    function formatDate(date) {
      return new Date(date).toLocaleString();
    }

    // 获取举报类型
    function getAccusationType(accusation) {
      if (accusation.accused_goods_id) return '商品举报';
      if (accusation.order_comment_id) return '订单评价举报';
      if (accusation.goods_comment_id) {
        return accusation.second_goods_comment_id ? '商品评论回复举报' : '商品评论举报';
      }
      return '其他举报';
    }

    // 获取被举报对象
    function getAccusedTarget(accusation) {
      if (accusation.accused_goods_id) return `商品${accusation.accused_goods_id}`;
      if (accusation.accused_user_id) return `用户${accusation.accused_user_id}`;
      return '未知对象';
    }

    onMounted(() => {
      document.addEventListener('click', closeDropdown);
      fetchManagerInfo();
    });

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdown);
    });

    return {
      adminAvatar,
      adminName,
      dropdownVisible,
      activeMenu,
      toggleDropdown,
      handleMenuSelect,
      viewProfile,
      viewNotifications,
      contactUs,
      showPublishDialog,
      announceFormRef,
      announceForm,
      announceRules,
      handleCloseDialog,
      submitAnnouncement,
      searchUserId,
      userInfo,
      userAvatarUrl,
      searchUser,
      announces,
      accusations,
      formatDate,
      getAccusationType,
      getAccusedTarget
    };
  }
};
</script>

<style scoped>
.manager-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #ff5000;
  padding: 10px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-text {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-profile {
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  min-width: 150px;
  padding: 5px 0;
  z-index: 1000;
}

.dropdown-menu .el-button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 15px;
}

.main-content {
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  gap: 20px;
}

.sidebar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.content {
  flex: 1;
  padding: 0;
}

.section {
  margin-bottom: 20px;
}

.section :deep(.el-card__header) {
  padding: 15px 20px;
  background-color: #fff6f0;
  border-bottom: 1px solid #ffeee5;
}

.section h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-menu-item .el-icon {
  margin-right: 8px;
}

.el-menu-item.is-active {
  color: #ff5000 !important;
  background-color: #fff6f0 !important;
}

.el-menu-item:hover {
  background-color: #fff6f0 !important;
}

.dropdown-menu .el-button:hover {
  color: #ff5000;
  background-color: #fff6f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publish-btn {
  background: linear-gradient(135deg, #ff6a00, #ff5000);
  border: none;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 80, 0, 0.2);
}

.publish-btn .el-icon {
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
}

:deep(.el-dialog__header) {
  background-color: #fff6f0;
  margin-right: 0;
  padding: 15px 20px;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}

.search-area {
  margin-bottom: 20px;
}

.search-input {
  max-width: 400px;
}

.user-info-card {
  margin-top: 20px;
}

.user-info-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.info-row {
  margin-bottom: 10px;
}

.info-row .label {
  color: #666;
  margin-right: 10px;
  font-weight: bold;
}

.info-row .value {
  color: #333;
}

.ban-action {
  display: flex;
  align-items: center;
}

.ban-action .el-button {
  min-width: 80px;
}

/* 搜索按钮样式 */
.search-input :deep(.el-input-group__append) {
  background-color: #ff5000;
  border-color: #ff5000;
  color: white;
}

.search-input :deep(.el-input-group__append:hover) {
  background-color: #ff6a00;
  border-color: #ff6a00;
}

.search-input :deep(.el-input-group__append .el-icon) {
  margin-right: 4px;
}

.announce-list {
  margin-top: 20px;
}

.announce-card {
  margin-bottom: 10px;
}

.announce-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announce-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.announce-content {
  margin: 10px 0 0;
  color: #666;
  line-height: 1.5;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
}

:deep(.el-table) {
  margin-top: 20px;
}
</style> 