<template>
    <div class="profile-view">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="nav-container">
          <div class="welcome-text">个人信息中心</div>
          <div class="user-section">
            <button class="announcement-btn" @click="fetchAnnouncements">
              <el-icon><Bell /></el-icon>
            </button>
            <div class="user-profile">
              <!-- <img 
                :src="userAvatar" 
                alt="用户头像" 
                class="avatar" 
                @click.stop="toggleDropdown"
              /> -->
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
  
      <!-- 主要内容区域 -->
      <main class="main-content">
        <div class="profile-container">
          <!-- 左侧个人信息 -->
          <div class="personal-info-card">
            <div class="avatar-section">
              <div class="avatar-container">
                <img :src="userAvatar" alt="用户头像" class="large-avatar" />
                <div class="avatar-overlay" @click="triggerAvatarUpload">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
              <input 
                type="file" 
                ref="avatarInput" 
                style="display: none" 
                accept="image/*"
                @change="handleAvatarChange"
              />
            </div>
  
            <!-- 显示用户信息 -->
            <div class="user-info">
              <p><strong>用户名：</strong>{{ userForm.user_name }}</p>
              <p><strong>手机号：</strong>{{ userForm.phone_number }}</p>
              <p><strong>简介：</strong>{{ userForm.other_information }}</p>
              <el-button type="primary" @click="openEditDialog">编辑信息</el-button>
            </div>
          </div>
  
          <!-- 右侧商品列表 -->
          <div class="my-goods-section">
            <h2 class="section-title">我发布的商品</h2>
            <div class="goods-grid">
              <div 
                v-for="good in paginatedGoods" 
                :key="good.goods_id" 
                class="good-card"
                @click="goToDetails(good)"
              >
                <div class="good-image">
                  <img :src="good.picture" :alt="good.goods_name" />
                </div>
                <div class="good-info">
                  <h3 class="good-name">{{ good.goods_name }}</h3>
                  <p class="good-price">¥{{ good.goods_price }}</p>
                  <div class="good-status" :class="good.status">
                    {{ getStatusText(good.status) }}
                  </div>
                </div>
              </div>
            </div>
  
            <!-- 分页控件 -->
            <div class="pagination" v-if="totalPages > 1">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="myGoods.length"
                layout="prev, pager, next"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </main>
  
      <!-- 系统公告弹窗 -->
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
  
      <!-- 编辑信息对话框 -->
      <el-dialog
        v-model="showEditDialog"
        title="编辑个人信息"
        width="30%"
        :before-close="handleCloseEdit"
      >
        <el-form 
          :model="editForm" 
          :rules="editRules"
          ref="editFormRef"
          label-width="80px"
        >
          <el-form-item label="用户名" prop="user_name">
            <el-input v-model="editForm.user_name" />
          </el-form-item>
  
          <el-form-item label="手机号" prop="phone_number">
            <el-input v-model="editForm.phone_number" />
          </el-form-item>

          <el-form-item label="简介" prop="other_information">
          <el-input v-model="editForm.other_information" type="textarea" />
        </el-form-item>
  
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="editForm.password" 
              type="password"
              placeholder="输入新密码(不修改请留空)"
            />
          </el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleCloseEdit">取消</el-button>
            <el-button type="primary" @click="submitEdit">
              确认修改
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { Bell, Camera } from '@element-plus/icons-vue';
  import defaultAvatar from '@/assets/tubiao.png';
  
  export default {
    name: 'UserProfile',
    components: {
      Bell,
      Camera
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const userFormRef = ref(null);
  
      // 用户信息相关
      const userAvatar = ref(defaultAvatar);
      const userForm = ref({
        user_name: '',
        phone_number: '',
        other_information: '',
        password: ''
      });
      const editFormRef = ref(null);
      const editForm = ref({
        user_name: '',
        phone_number: '',
        other_information: '',
        password: ''
      });
      const showEditDialog = ref(false);

      const avatarInput = ref(null);

      function triggerAvatarUpload() {
        avatarInput.value.click();
      }
  
      // 表单验证规则
      const editRules = {
        user_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone_number: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ]
      };
  
      // 商品列表相关
      const myGoods = ref([]);
      const currentPage = ref(1);
      const pageSize = 8;
  
      // 其他状态
      const dropdownVisible = ref(false);
      const announcements = ref([]);
      const showAnnouncementDialog = ref(false);
  
      // 计算属性
      const totalPages = computed(() => Math.ceil(myGoods.value.length / pageSize));
      const paginatedGoods = computed(() => {
        const start = (currentPage.value - 1) * pageSize;
        return myGoods.value.slice(start, start + pageSize);
      });
  
     
  
      // 打开编辑对话框
      function openEditDialog() {
        editForm.value = { ...userForm.value };
        showEditDialog.value = true;
      }
  
      // 提交编辑
      async function submitEdit() {
        console.log(editFormRef.value);
        if (!editFormRef.value) {
            console.log("editFormRef.value is null");
            return;
        };
        
        try {
          await editFormRef.value.validate();
          console.log(editForm.value);
          
          const response = await fetch("/user_profile", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': 'update_profile'
            },
            body: JSON.stringify({
              user_id: route.query.user_id,
              ...editForm.value
            })
          });
  
          if (!response.ok) throw new Error('更新失败');
  
          const data = await response.json();
          if (data.success) {
            ElMessage.success('个人信息更新成功');
            userForm.value = { ...editForm.value };
            showEditDialog.value = false;
          } else {
            ElMessage.error(data.message || '更新失败');
          }
        } catch (error) {
          console.error('Error saving changes:', error);
          ElMessage.error('保存失败，请重试');
        }
      }
  
      function handleCloseEdit() {
        showEditDialog.value = false;
      }
  
      // 头像上传相关函数
      async function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;
  
        // 验证文件类型和大小
        if (!file.type.startsWith('image/')) {
          ElMessage.error('请上传图片文件');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          ElMessage.error('图片大小不能超过5MB');
          return;
        }
  
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          formData.append('user_id', user_id);
  
          const response = await fetch("/user_profile", {
            method: 'POST',
            headers: {
              'type': 'update_avatar'
            },
            body: formData
          });
  
          if (!response.ok) throw new Error('上传失败');
  
          const data = await response.json();
          if (data.success) {
            userAvatar.value = URL.createObjectURL(file);
            ElMessage.success('头像更新成功');
          } else {
            ElMessage.error(data.message || '上传失败');
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
          ElMessage.error('头像上传失败，请重试');
        }
      }
  
      function goToDetails(good) {
        router.push({
          name: 'GoodDetails',
          params: { 
            productId: good.goods_id
          },
          query: {
            ...route.query,
            isOwner: true  // 标记是否为商品所有者
          }
        });
      }
  
      function getStatusText(status) {
        const statusMap = {
          'on_sale': '在售',
          'sold': '已售出',
          'removed': '已下架'
        };
        return statusMap[status] || '未知状态';
      }
  
      function handlePageChange(page) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  
      // 获取用户信息
      async function fetchUserInfo() {
        try {
          const response = await fetch("/user_profile", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': 'get_profile'
            },
            body: JSON.stringify({
              user_id: route.query.user_id
            })
          });
  
          if (!response.ok) throw new Error('获取用户信息失败');
  
          const data = await response.json();
          if (data.success) {
            userForm.value = {
              user_name: data.user_name,
              phone_number: data.phone_number,
              other_information: data.other_information || '',
              password: ''
            };
            if (data.picture_url) {
              userAvatar.value = URL.createObjectURL(base64ToBlob(data.picture_url));
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          ElMessage.error('获取用户信息失败');
        }
      }
  
      // 获取用户发布的商品
      async function fetchUserGoods() {
        try {
          const response = await fetch("/user_profile", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': 'get_user_goods'
            },
            body: JSON.stringify({
              user_id: route.query.user_id
            })
          });
  
          if (!response.ok) throw new Error('获取商品列表失败');
  
          const data = await response.json();
          if (data.success) {
            myGoods.value = data.goods.map(good => ({
              ...good,
              picture: good.picture ? URL.createObjectURL(base64ToBlob(good.picture)) : defaultAvatar
            }));
          }
        } catch (error) {
          console.error('Error fetching user goods:', error);
          ElMessage.error('获取商品列表失败');
        }
      }
  
      function base64ToBlob(base64) {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        return new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });
      }
  
      // 生命周期钩子
      onMounted(() => {
        fetchUserInfo();
        fetchUserGoods();
      });
  
      return {
        userAvatar,
        userForm,
        editForm,
        userFormRef,
        showEditDialog,
        openEditDialog,
        submitEdit,
        handleCloseEdit,
        handleAvatarChange,
        myGoods,
        currentPage,
        pageSize,
        totalPages,
        paginatedGoods,
        dropdownVisible,
        announcements,
        showAnnouncementDialog,
        goToDetails,
        getStatusText,
        handlePageChange,
        triggerAvatarUpload,
        avatarInput,
        editFormRef,
        editRules
      };
    }
  };
  </script>
  
  <style scoped>
  .profile-view {
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .header {
    background-color: #ff5000;
    padding: 8px 20px; /* 减小上下内边距 */
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    height: 40px; /* 固定导航栏高度 */
  }
  
  .welcome-text {
    color: #fff;
    font-size: 18px;
    font-weight: bold;
  }
  
  .main-content {
    max-width: 1200px;
    margin: 10px auto; /* 减小顶部边距 */
    padding: 0 20px;
    min-height: calc(100vh - 56px); /* 减去header高度 */
  }
  
  .profile-container {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 20px;
  }
  
  .personal-info-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
  }
  
  .avatar-container {
    position: relative;
    width: 120px;  /* 固定头像容器宽度 */
    height: 120px; /* 固定头像容器高度 */
    border-radius: 50%;
    overflow: hidden;
    margin: 20px auto; /* 居中显示 */
  }
  
  .large-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 保持图片比例并填充容器 */
  }
  
  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
  }
  
  .avatar-overlay:hover {
    opacity: 1;
  }
  
  .avatar-overlay .el-icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  .user-form {
    margin-top: 20px;
  }
  
  .my-goods-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .section-title {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
    font-weight: bold;
  }
  
  .goods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .good-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    cursor: pointer;
  }
  
  .good-card:hover {
    transform: translateY(-5px);
  }
  
  .good-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
  }
  
  .good-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .good-info {
    padding: 15px;
  }
  
  .good-name {
    margin: 0;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .good-price {
    margin: 10px 0;
    color: #ff5000;
    font-size: 16px;
    font-weight: bold;
  }
  
  .good-status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: white;
  }
  
  .good-status.on_sale {
    background-color: #67c23a;
  }
  
  .good-status.sold {
    background-color: #909399;
  }
  
  .good-status.removed {
    background-color: #f56c6c;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  /* Element Plus 组件样式覆盖 */
  :deep(.el-input__inner) {
    border-radius: 4px;
  }
  
  :deep(.el-button--primary) {
    background-color: #ff5000;
    border-color: #ff5000;
  }
  
  :deep(.el-button--primary:hover) {
    background-color: #ff6a00;
    border-color: #ff6a00;
  }
  
  :deep(.el-form-item__label) {
    color: #333;
  }
  
  .user-info {
    text-align: center;
    margin-top: 20px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  </style>