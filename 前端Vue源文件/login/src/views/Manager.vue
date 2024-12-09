<template>
  <div class="manager-view">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="nav-container">
        <div class="welcome-text">管理员控制台</div>
        
        <div class="user-section">
          <div class="user-profile">
            <span class="admin-greeting" @click.stop="toggleDropdown">
              尊敬的管理员{{ adminName }}，您好！
            </span>
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
                <div class="user-avatar" 
                     @click="viewUserProfile" 
                     style="cursor: pointer;" 
                     title="点击查看用户主页">
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
                    v-if="!userInfo.isbanned"
                    type="danger"
                    @click="handleBanUser"
                  >
                    封禁
                  </el-button>
                  <el-button 
                    v-else
                    type="success"
                    @click="handleUnban(searchUserId)"
                  >
                    解除封禁
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
  Plus,  // 加 Plus 图标
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
        
        const response = await fetch("/manager", {
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
          await fetchManagerInfo();
        } else {
          ElMessage.error('公告发布失败，请重试');
        }
      } catch (error) {
        ElMessage.error('发布失败，请稍后重试');
      }
    }

    // 修改搜索用户函数
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
        
        // 直接使用返回的据，因为格式已经匹配
        if (data.picture_url) {
          const blob = base64ToBlob(data.picture_url);
          userAvatarUrl.value = URL.createObjectURL(blob);
        } else {
          userAvatarUrl.value = defaultAvatar;
        }
        
        // 更新用户信息，完全匹配接口返回格式
        userInfo.value = {
          phone_number: data.phone_number,
          user_name: data.user_name,
          other_information: data.other_information,
          isbanned: data.isbanned
        };
        
        ElMessage.success('查找用户成功');
        
      } catch (error) {
        console.error('Error searching user:', error);
        ElMessage.error('搜索用户失败，请重试');
        userInfo.value = null;
        userAvatarUrl.value = defaultAvatar;
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
      if (accusation.goods_comment_id) {
        return '商品评论举报';
      }
      if (accusation.second_goods_comment_id) {
        return '商品评论复举报';
      }
      if (accusation.second_order_comment_id) {
        return '订单评论举报';
      }
      if (accusation.order_comment_id) {
        return '订单举报';
      }
      if (accusation.accused_goods_id) {
        return '商品举报';
      }
      if (accusation.accuser_id) {
        return '用户举报';
      }
      return '其他举报';
    }

    // 修改获取被举报对象函数
    function getAccusedTarget(accusation) {
      if (accusation.goods_comment_id) {
        return `商品评论${accusation.goods_comment_id}`;
      }
      if (accusation.second_goods_comment_id) {
        return `商品评论回复${accusation.second_goods_comment_id}`;
      }
      if (accusation.second_order_comment_id) {
        return `订单评论回复${accusation.second_order_comment_id}`;
      }
      if (accusation.order_comment_id) {
        return `订单评论${accusation.order_comment_id}`;
      }
      if (accusation.accused_goods_id) {
        return `商品${accusation.accused_goods_id}`;
      }
      if (accusation.accused_user_id) {
        return `用户${accusation.accused_user_id}`;
      }
      return '未知对象';
    }

    // 在 setup 函数中添加处理举报的函数
    async function handleAccusation(accusation) {
      try {
        const response = await fetch("/manager", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'deal_accuse'
          },
          body: JSON.stringify({
            accusation_id: accusation.accusation_id
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('举报处理成功');
          // 重新获取举报列表
          await fetchManagerInfo();
        } else {
          ElMessage.error('处理失败，请重试');
        }
      } catch (error) {
        console.error('Error handling accusation:', error);
        ElMessage.error('处理失败，请稍后重试');
      }
    }

    // 在 setup 函数中添加删除公告的函数
    async function handleDeleteAnnounce(announceId) {
      try {
        const response = await fetch("/manager", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'delete_announce'
          },
          body: JSON.stringify({
            announce_id: announceId
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('公告删除成功');
          // 重新获取公告列表
          await fetchManagerInfo();
        } else {
          ElMessage.error('删除失败，请重试');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        ElMessage.error('删除失败，请稍后重试');
      }
    }

    // 添加查看用户主页函数
    function viewUserProfile() {
      // 使用window.open在新标签页打开用户主页
      const routeUrl = `/profile?user_id=${searchUserId.value}&current_user_id=${route.query.admin_id}&viewing_own_profile=false`;
      window.open(routeUrl, '_blank');
    }

    // 在setup中添加处理函数
    async function handleBanUser() {
      try {
        const response = await fetch("/manager", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'ban'
          },
          body: JSON.stringify({
            user_id: parseInt(searchUserId.value)
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('用户封禁成功');
          // 更新本地用户状态
          userInfo.value.isbanned = true;
        } else {
          ElMessage.error('封禁失败，请重��');
        }
      } catch (error) {
        console.error('Error banning user:', error);
        ElMessage.error('封禁操作失败，请稍后重试');
      }
    }

    // 修改解除封禁函数
    async function handleUnban(userId) {
      try {
        const response = await fetch("/manager", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'deban'
          },
          body: JSON.stringify({
            user_id: userId
          })
        });

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('解除封禁成功');
          // 直接更新本地用户状态
          userInfo.value.isbanned = false;
        } else {
          ElMessage.error('解除封禁失败');
        }
      } catch (error) {
        console.error('解除封禁请求失败:', error);
        ElMessage.error('解除封禁失败，请重试');
      }
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
      getAccusedTarget,
      handleAccusation,
      handleDeleteAnnounce,
      viewUserProfile,
      handleBanUser,
      handleUnban,
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
  display: none;
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

.admin-greeting {
  color: white;
  font-size: 16px;
  font-family: "Microsoft YaHei", sans-serif;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.admin-greeting:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-status {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.user-status .el-button {
  font-size: 14px;
  padding: 6px 12px;
}
</style> 