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
            <div class="section-header">
              <h2 class="section-title">我发布的商品</h2>
              <el-button type="primary" @click="openPublishDialog">发布商品</el-button>
            </div>
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
             <!-- 添加收藏商品显示组件 -->
    <div class="favorites-container">
      <h2>我的收藏</h2>
      <div class="favorites-grid">
        <div v-if="!favorites || favorites.length === 0" class="no-favorites">
          暂无收藏商品
        </div>
        <div 
          v-else
          v-for="favorite in paginatedFavorites" 
          :key="favorite.goods_id" 
          class="favorite-card"
          @click="goToGoodsDetails(favorite)"
        >
          <div class="favorite-image">
            <img :src="favorite.picture" :alt="favorite.goods_name" />
          </div>
          <div class="favorite-info">
            <h3 class="favorite-name">{{ favorite.goods_name }}</h3>
            <p class="favorite-price">¥{{ favorite.goods_price }}</p>
          </div>
        </div>
      </div>
      
      <!-- 收藏商品分页控件 -->
      <div class="pagination" v-if="favorites.length > favoritesPageSize">
        <button 
          class="page-button"
          :disabled="favoritesCurrentPage === 1"
          @click="handleFavoritesPageChange(favoritesCurrentPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">
          {{ favoritesCurrentPage }} / {{ favoritesPagesTotal }}
        </span>
        <button 
          class="page-button"
          :disabled="favoritesCurrentPage === favoritesPagesTotal"
          @click="handleFavoritesPageChange(favoritesCurrentPage + 1)"
        >
          下一页
        </button>
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

    <!-- 添加发布商品对话框 -->
    <el-dialog
      v-model="showPublishDialog"
      title="发布新商品"
      width="50%"
      :before-close="handleClosePublish"
    >
      <el-form 
        :model="publishForm" 
        :rules="publishRules"
        ref="publishFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="publishForm.goods_name" />
        </el-form-item>

        <el-form-item label="商品类别" prop="category_name">
          <el-select v-model="publishForm.category_name" placeholder="请选择商品类别">
            <el-option label="体育运动" value="sport" />
            <el-option label="学习用品" value="study" />
            <el-option label="电子数码" value="digital" />
            <el-option label="衣物饰品" value="cloth" />
            <el-option label="其他类别" value="else" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品价格" prop="goods_price">
          <el-input-number 
            v-model="publishForm.goods_price" 
            :min="0" 
            :precision="2" 
            :step="0.1" 
            
            
          >
            <template #suffix>元</template> 
          </el-input-number>
        </el-form-item>

        <el-form-item label="商品描述" prop="goods_description">
          <el-input v-model="publishForm.goods_description" type="textarea" />
        </el-form-item>

        <el-form-item label="商品状态" prop="goods_state">
          <el-select v-model="publishForm.goods_state" placeholder="请选择商品状态">
            <el-option label="在售" value="在售" />
            <el-option label="已售出" value="已售出" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品图片" prop="goods_pictures">
          <el-upload
            class="goods-uploader"
            :action="uploadUrl"
            :show-file-list="true"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :file-list="fileList"
            multiple
            list-type="picture-card"
            :on-preview="handlePreview"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          
          <!-- 添加图片预览组件 -->
          <el-image-viewer
            v-if="showViewer"
            :url-list="fileList.map(file => file.url)"
            :initial-index="previewIndex"
            @close="showViewer = false"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClosePublish">取消</el-button>
          <el-button type="primary" @click="submitPublish">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { Bell, Camera, Plus } from '@element-plus/icons-vue';
  import defaultAvatar from '@/assets/tubiao.png';
  import { ElImageViewer } from 'element-plus';
  
  export default {
    name: 'UserProfile',
    components: {
      Bell,
      Camera,
      Plus,
      ElImageViewer
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const userFormRef = ref(null);
      const favorites = ref([]);

  
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
      const pageSize = 3;
  
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
      
        // base64 转 Blob 函数
    function base64ToBlob(base64) {
      try {
        // 解码 base64 字符串
        const byteCharacters = atob(base64);
        const byteArrays = [];

        // 将字符串转换为字节数组
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        // 创建 Blob 对象
        return new Blob(byteArrays, { type: 'image/jpeg' });
      } catch (error) {
        console.error('Error converting base64 to Blob:', error);
        return null;
      }
    }

     
  
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
  
      // 跳转至自己创建的商品详情
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

      // 跳转至收藏商品详情
      function goToGoodsDetails(favorite) {
        router.push({
          name: 'GoodDetails',
          params: { 
            productId: favorite.goods_id
          },
          query: {
            ...route.query,
            current_user_id: route.query.user_id  // 确保传递用户ID
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
          console.log("response:", response);
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

      // 获取收藏商品 TODO：后端
      async function fetchFavorites() {
    try {
      const response = await fetch("/user_profile", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'type': 'get_favorites'
        },
        body: JSON.stringify({
          user_id: route.query.user_id
        })
      });

      if (!response.ok) throw new Error('获取收藏失败');

      const data = await response.json();
      console.log("data:", data);
      if (data.success) {
        favorites.value = data.favorites.map(favorite => ({
          ...favorite,
          picture: favorite.picture ? URL.createObjectURL(base64ToBlob(favorite.picture)) : defaultAvatar
        }));
        console.log("favorites:", favorites.value);
      }
    } catch (error) {
        console.error('Error fetching favorites:', error);
        ElMessage.error('获取收藏失败');
        }
      }
  
      // 生命周期钩子
      onMounted(() => {
        fetchUserInfo();
        fetchUserGoods();
        fetchFavorites();
        
        // 监听收藏状态变化
        window.addEventListener('collect-changed', handleCollectChange);
      });
  
      // 添加发布商品相关的响应式变量
      const showPublishDialog = ref(false);
      const publishFormRef = ref(null);
      const fileList = ref([]);
      const previewUrl = ref('');
      const imagePreview = ref(null);

      const publishForm = ref({
        goods_name: '',
        category_name: '',
        goods_price: 0,
        goods_description: '',
        goods_state: '',
        goods_pictures: [],
        pictures_type: [],
        deleted_pictures: []  // 用于记录被删除的图片
      });

      const publishRules = {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        category_name: [
          { required: true, message: '请选择商品类别', trigger: 'change' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_description: [
          { required: true, message: '请输入商品描述', trigger: 'blur' }
        ],
        goods_state: [
          { required: true, message: '请选择商品状态', trigger: 'change' }
        ],
        goods_pictures: [
        { 
        required: true, 
        validator: (rule, value, callback) => {
          if (!publishForm.value.goods_pictures || publishForm.value.goods_pictures.length === 0) {
            callback(new Error('请至少上传一张商品图片'));
          } else {
            callback();
          }
        },
        trigger: 'change'
        }
      ]
      };

      // 上传相关配置
      const uploadUrl = '/goods_picture_show';
      const uploadHeaders = {
        'type': 'upload_picture'
      };
      const uploadData = computed(() => ({
        user_id: route.query.user_id
      }));

      // 处理函数
      function openPublishDialog() {
        showPublishDialog.value = true;
      }

      function handleClosePublish() {
        publishFormRef.value?.resetFields();
        fileList.value = [];
        publishForm.value.goods_pictures = [];
        publishForm.value.pictures_type = [];
        publishForm.value.deleted_pictures = [];
        showPublishDialog.value = false;
      }

      function handleUploadSuccess(response, file) {
        if (response.success) {
          fileList.value.push({
            name: file.name,
            url: URL.createObjectURL(file.raw),
            uid: file.uid
          });
          publishForm.value.goods_pictures.push(response.url);
          publishForm.value.pictures_type.push(file.name);
          ElMessage.success('图片上传成功');
        } else {
          ElMessage.error(response.message || '上传失败');
        }
      }

      function handleUploadError(error) {
        console.error('Upload error:', error);
        ElMessage.error('图片上传失败，请重试');
      }

      function handleRemove(file) {
        const index = fileList.value.findIndex(f => f.uid === file.uid);
        if (index !== -1) {
          publishForm.value.deleted_pictures.push(publishForm.value.pictures_type[index]);
          publishForm.value.goods_pictures.splice(index, 1);
          publishForm.value.pictures_type.splice(index, 1);
          fileList.value.splice(index, 1);
        }
      }

      function handlePreview(file) {
        previewIndex.value = fileList.value.findIndex(f => f.uid === file.uid);
        showViewer.value = true;
      }

      function beforeUpload(file) {
        const isImage = file.type.startsWith('image/');
        const isLt5M = file.size / 1024 / 1024 < 5;

        if (!isImage) {
          ElMessage.error('只能上传图片文件!');
          return false;
        }
        if (!isLt5M) {
          ElMessage.error('图片大小不能超过 5MB!');
          return false;
        }
        return true;
      }

      async function submitPublish() {
        if (!publishFormRef.value) return;

        try {
          await publishFormRef.value.validate();

          // 第一步：向后端申请一个新的 goods_id
          const idResponse = await fetch("/goods_detail", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': 'request_goods_id'
            },
            body: JSON.stringify({
              user_id: route.query.user_id
            })
          });

          if (!idResponse.ok) throw new Error('申请商品ID失败');

          const idData = await idResponse.json();
          if (!idData.success) {
            throw new Error(idData.message || '申请商品ID失败');
          }

          const newGoodsId = idData.goods_id;
          
          const response = await fetch("/goods_detail", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': 'update_goods'
            },
            body: JSON.stringify({
              info: {
              goods_id: newGoodsId,
              goods_name: publishForm.value.goods_name,
              category_name: publishForm.value.category_name,
              goods_price: publishForm.value.goods_price,
              goods_description: publishForm.value.goods_description,
              goods_state: publishForm.value.goods_state,
              goods_pictures: publishForm.value.goods_pictures,
              pictures_type: publishForm.value.pictures_type
            }
            })
          });

          if (!response.ok) throw new Error('发布失败');

          const data = await response.json();
          if (data.success) {
            ElMessage.success('商品发布成功');
            handleClosePublish();
            // 刷新商品列表
            if (typeof fetchUserGoods === 'function') {
              await fetchUserGoods();
            }
          } else {
            ElMessage.error(data.message || '发布失败');
          }
        } catch (error) {
          console.error('Error publishing goods:', error);
          ElMessage.error('发布失败，请重试');
        }
      }
  
      const showViewer = ref(false);
      const previewIndex = ref(0);

      // 添加收藏商品分页相关的响应式变量
      const favoritesCurrentPage = ref(1);
      const favoritesPageSize = 6; // 每页显示6个收藏商品
      
      // 添加收藏商品分页的计算属性
      const favoritesPagesTotal = computed(() => 
        Math.ceil(favorites.value.length / favoritesPageSize)
      );
      
      const paginatedFavorites = computed(() => {
        const start = (favoritesCurrentPage.value - 1) * favoritesPageSize;
        const end = start + favoritesPageSize;
        return favorites.value.slice(start, end);
      });
      
      // 处理收藏商品分页变化
      function handleFavoritesPageChange(page) {
        favoritesCurrentPage.value = page;
      }
  
      // 添加监听收藏变化的方法
      function handleCollectChange(event) {
        // 重新获取收藏列表
        fetchFavorites();
      }
  
      // 在 onUnmounted 中移除事件监听
      onUnmounted(() => {
        window.removeEventListener('collect-changed', handleCollectChange);
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
        editRules,
        favorites,
        goToGoodsDetails,
        showPublishDialog,
        publishForm,
        publishFormRef,
        publishRules,
        fileList,
        uploadUrl,
        uploadHeaders,
        uploadData,
        openPublishDialog,
        handleClosePublish,
        handleUploadSuccess,
        handleUploadError,
        handleRemove,
        handlePreview,
        beforeUpload,
        submitPublish,
        showViewer,
        previewIndex,
        base64ToBlob,
        handleFavoritesPageChange,
        favoritesCurrentPage,
        favoritesPageSize,
        favoritesPagesTotal,
        paginatedFavorites,
        handleCollectChange
      };
    }
  };
  </script>
  
  <style scoped>
  
  .right-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

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
    gap: 40px;
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
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .section-title {
    margin: 0;
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

 

.favorites-container {
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 40px;  /* 添加底部间距，避免贴近页面底部 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.favorite-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.favorite-card:hover {
  transform: translateY(-5px);
}

.favorite-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-info {
  padding: 15px;
}

.favorite-name {
  margin: 0;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.favorite-price {
  margin: 10px 0 0;
  color: #ff5000;
  font-size: 18px;
  font-weight: bold;
}

.no-favorites {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
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
  </style>