<template>
    <div class="profile-view">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="nav-container">
          <div class="welcome-text">个人信息中心</div>
          <div class="user-section">
            <!-- <button class="announcement-btn" @click="fetchAnnouncements">
              <el-icon><Bell /></el-icon>
            </button> -->
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
                <div 
                  v-if="isCurrentUser" 
                  class="avatar-overlay" 
                  @click="triggerAvatarUpload"
                >
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
              <input 
                v-if="isCurrentUser"
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
              <div class="button-group" v-if="isCurrentUser">
                <el-button type="primary" @click="openEditDialog">编辑信息</el-button>
                <el-button type="primary" @click="openAddressDialog">查看收货地址</el-button>
                
              </div>
              <div class="button-group" v-else>
                <el-button 
                   type="primary"
                   @click="openChatDialog"
                   class="chat-btn"
                 >
                   <el-icon><ChatDotRound /></el-icon>
                   发送私信
                </el-button>
              <el-button 
                v-if="!isCurrentUser"
                type="danger"
                size="small"
                plain
                @click="handleReport"
                class="report-btn"
              >
                <el-icon><Warning /></el-icon>
                举报用户
              </el-button>
            </div>
            </div>
            
          </div>
  
          <!-- 右侧商品列表 -->
          <div class="my-goods-section">
            <div class="section-header">
              <h2 class="section-title">已发布的商品</h2>
              <el-button 
                v-if="isCurrentUser"
                type="primary" 
                @click="openPublishDialog"
              >
                发布商品
              </el-button>
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


        <!-- 收藏商品显示组件 -->
        <div v-if="isCurrentUser" class="favorites-container">
          <div class="favorites-section">
            <h2>我的收藏</h2>
            <div class="goods-grid">
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
              <el-pagination
                v-model:current-page="favoritesCurrentPage"
                :page-size="favoritesPageSize"
                :total="favorites.length"
                layout="prev, pager, next"
                @current-change="handleFavoritesPageChange"
              />
            </div>
          </div>
        </div>

        
        <!-- 订单部分 - 移动到这里，在 profile-container 和 favorites-container 之间 -->
        <div class="orders-section" v-if="isCurrentUser || !isCurrentUser">
          <div class="section-header">
            <h2 class="section-title">{{ isCurrentUser ? '我的订单' : '卖家的订单' }}</h2>
          </div>
          
          <!-- 只有当前用户查看自己的页面时才显示订单类型切换 -->
          <el-tabs v-model="activeOrderTab" class="order-tabs" v-if="isCurrentUser">
            <el-tab-pane label="已买到的" name="bought">
              <div class="orders-grid">
                <div v-if="!boughtOrders || boughtOrders.length === 0" class="no-orders">
                  暂无已买到的订单
                </div>
                <div v-else v-for="order in paginatedBoughtOrders" 
                     :key="order.goods_id" 
                     class="order-card" 
                     @click="goToOrderDetails(order)">
                  <img :src="order.goods_picture" :alt="order.goods_name" class="order-image"/>
                  <div class="order-info">
                    <h3>{{ order.goods_name }}</h3>
                    <div class="order-price">¥{{ order.goods_price }}</div>
                    <div class="order-status">{{ getOrderStatusText(order.order_state) }}</div>
                    <div class="order-time">{{ formatTime(order.deal_time) }}</div>
                    <div class="order-actions">
                      <el-button 
                        v-if="order.order_state === '已下单'"
                        type="primary" 
                        size="small"
                        @click.stop="confirmDelivery(order.goods_id)"
                      >
                        确认送达
                      </el-button>
                      <el-button 
                        v-if="['已下单', '已送达'].includes(order.order_state)"
                        type="danger" 
                        size="small"
                        @click.stop="requestRefund(order.goods_id)"
                      >
                        申请退款
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 已买到的订单分页控件 -->
              <div class="pagination" v-if="boughtOrders && boughtOrders.length > ordersPageSize">
                <el-pagination
                  v-model:current-page="boughtOrdersCurrentPage"
                  :page-size="ordersPageSize"
                  :total="boughtOrders.length"
                  layout="prev, pager, next"
                  @current-change="handleBoughtOrdersPageChange"
                />
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="已卖出的" name="sold">
              <div class="orders-grid">
                <div v-if="!soldOrders || soldOrders.length === 0" class="no-orders">
                  暂无已卖出的订单
                </div>
                <div v-else v-for="order in paginatedSoldOrders" 
                     :key="order.goods_id" 
                     class="order-card" 
                     @click="goToOrderDetails(order)">
                  <img :src="order.goods_picture" :alt="order.goods_name" class="order-image"/>
                  <div class="order-info">
                    <h3>{{ order.goods_name }}</h3>
                    <div class="order-price">¥{{ order.goods_price }}</div>
                    <div class="order-status">{{ getOrderStatusText(order.order_state) }}</div>
                    <div class="order-time">{{ formatTime(order.deal_time) }}</div>
                  </div>
                </div>
              </div>
              <!-- 已卖出的订单分页控件 -->
              <div class="pagination" v-if="soldOrders && soldOrders.length > ordersPageSize">
                <el-pagination
                  v-model:current-page="soldOrdersCurrentPage"
                  :page-size="ordersPageSize"
                  :total="soldOrders.length"
                  layout="prev, pager, next"
                  @current-change="handleSoldOrdersPageChange"
                />
              </div>
            </el-tab-pane>
          </el-tabs>

          <!-- 当其他用户查看卖家页面时，只显示已卖出的订单 -->
          <div v-else class="orders-grid">
            <div v-if="!soldOrders || soldOrders.length === 0" class="no-orders">
              暂无已卖出的订单
            </div>
            <div v-else v-for="order in soldOrders" 
                 :key="order.goods_id" 
                 class="order-card" 
                 @click="goToOrderDetails(order)">
              <img :src="order.goods_picture" :alt="order.goods_name" class="order-image"/>
              <div class="order-info">
                <h3>{{ order.goods_name }}</h3>
                <div class="order-price">¥{{ order.goods_price }}</div>
                <div class="order-status">{{ getOrderStatusText(order.order_state) }}</div>
                <div class="order-time">{{ formatTime(order.deal_time) }}</div>
              </div>
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

    <!-- 添加举报对话框 -->
    <el-dialog
      v-model="showReportDialog"
      title="举报用户"
      width="30%"
      @close="handleCloseReport"
    >
      <el-form
        ref="reportFormRef"
        :model="reportForm"
        :rules="reportRules"
        label-width="80px"
      >
        <el-form-item label="举报原因" prop="content">
          <el-input
            v-model="reportForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述举报原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseReport">取消</el-button>
          <el-button type="primary" @click="submitReport">提交举报</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加收货地址对话框组件 -->
    <el-dialog
      v-model="showAddressDialog"
      title="收货地址管理"
      width="60%"
    >
      <div class="address-header">
        <el-button type="primary" @click="openAddAddressDialog">
          <el-icon><Plus /></el-icon>添加收货地址
        </el-button>
      </div>
      
      <el-table :data="addresses" style="width: 100%">
        <el-table-column prop="receiver_name" label="收货人" width="120" />
        <el-table-column prop="phone_number" label="联系电话" width="150" />
        <el-table-column prop="address" label="收货地址" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEditAddress(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDeleteAddress(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加/编辑地址的对话框 -->
    <el-dialog
      v-model="showAddressEditDialog"
      :title="addressDialogTitle"
      width="30%"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="receiver_name">
          <el-input v-model="addressForm.receiver_name" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone_number">
          <el-input v-model="addressForm.phone_number" />
        </el-form-item>
        <el-form-item label="收货地址" prop="address">
          <el-input
            v-model="addressForm.address"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddressEditDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAddress">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加私聊对话框 -->
    <el-dialog
      v-model="showChatDialog"
      title="发送私信"
      width="30%"
    >
      <el-form
        ref="chatFormRef"
        :model="chatForm"
        :rules="chatRules"
      >
        <el-form-item prop="content">
          <el-input
            v-model="chatForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入要发送的消息..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChatDialog = false">取消</el-button>
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Bell, Camera, Plus, Warning, Phone, ChatDotRound } from '@element-plus/icons-vue';
  import defaultAvatar from '@/assets/tubiao.png';
  import { ElImageViewer } from 'element-plus';
  
  export default {
    name: 'UserProfile',
    components: {
      Bell,
      Camera,
      Plus,
      ElImageViewer,
      Warning,
      Phone,
      ChatDotRound
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
          { pattern: /[1-9][0-9]*/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { min: 3, message: '密码长度不能小于3位', trigger: 'blur' }
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
            ElMessage.error(data.message || '更新失败，该手机号已被使用');
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
          // 将文件转换为 base64
          const reader = new FileReader();
          reader.readAsDataURL(file);
          
          reader.onload = async () => {
            // 获取 base64 字符串并去掉前缀
            const base64String = reader.result.split(',')[1];
            
            const response = await fetch("/user_profile", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'type': 'update_avatar'
              },
              body: JSON.stringify({
                picture: base64String,
                user_id: route.query.user_id,
                pictureName: file.name
              })
            });

            if (!response.ok) throw new Error('上传失败');

            const data = await response.json();
            if (data.success) {
              userAvatar.value = URL.createObjectURL(file);
              ElMessage.success('头像更新成功');
            } else {
              ElMessage.error(data.message || '上传失败');
            }
          };

          reader.onerror = (error) => {
            console.error('Error reading file:', error);
            ElMessage.error('读取文件失败');
          };

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
            //current_user_id: route.query.user_id,  // 当前浏览用户的ID
            current_user_id: route.query.current_user_id,
            userAvatar: route.query.userAvatar,
            from_profile: 'true',  // 表示从个人页面进入
            viewing_own_profile: route.query.current_user_id === route.query.user_id  // 是否在查看自己的个人页面
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
            current_user_id: route.query.current_user_id,
            userAvatar: route.query.userAvatar,
            from_favorite: 'true'  // 添加标记，表示从收藏列表进入
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
      const favoritesPageSize = 5; // 每页显示5个收藏商品
      
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
  
      // 判断是否是当前用户查看自己的页面
      const isCurrentUser = computed(() => {
        return route.query.current_user_id === route.query.user_id;
      });
  
      // 举报相关的响应式变量
      const showReportDialog = ref(false);
      const reportFormRef = ref(null);
      const reportForm = ref({
        content: ''
      });

      const reportRules = {
        content: [
          { required: true, message: '请输入举报原因', trigger: 'blur' },
          { min: 10, message: '举报原因至少10个字符', trigger: 'blur' }
        ]
      };

      // 处理举报
      function handleReport() {
        reportForm.value.content = '';
        showReportDialog.value = true;
      }

      // 关闭举报对话框
      function handleCloseReport() {
        reportFormRef.value?.resetFields();
        showReportDialog.value = false;
      }

      // 提交举报
      async function submitReport() {
        if (!reportFormRef.value) return;
        
        try {
          await reportFormRef.value.validate();
          
          const response = await fetch("/profile", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'type': 'accuse'
            },
            body: JSON.stringify({
              accuser_id: route.query.current_user_id,
              accused_user_id: route.query.user_id,
              content: reportForm.value.content
            })
          });

          if (!response.ok) throw new Error('Network response was not ok');

          const data = await response.json();
          if (data.success) {
            ElMessage.success('举报已提交');
            handleCloseReport();
          } else {
            ElMessage.error('举报提交失败，请重试');
          }
        } catch (error) {
          console.error('Error submitting report:', error);
          ElMessage.error('举报提交失败，请稍后重试');
        }
      }
  
      // 收货地址相关的响应式变量
      const showAddressDialog = ref(false);
      const showAddressEditDialog = ref(false);
      const addresses = ref([]);
      const addressForm = ref({
        address_id: '',
        receiver_name: '',
        phone_number: '',
        address: ''
      });
      const addressFormRef = ref(null);
      const isEditingAddress = ref(false);

      // 表单验证规则
      const addressRules = {
        receiver_name: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone_number: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入收货地址', trigger: 'blur' },
          { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
        ]
      };

      // 计算属性：对话框标题
      const addressDialogTitle = computed(() => {
        return isEditingAddress.value ? '编辑收货地址' : '添加收货地址';
      });

      // 打开地址管理对话框
      function openAddressDialog() {
        showAddressDialog.value = true;
        fetchAddresses();
      }

      // 获取收货地址列表
      async function fetchAddresses() {
        try {
          const response = await fetch("/user_profile", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': 'get_addresses'
            },
            body: JSON.stringify({
              user_id: route.query.user_id
            })
          });

          if (!response.ok) throw new Error('获取地址失败');

          const data = await response.json();
          if (data.success) {
            addresses.value = data.addresses;
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          ElMessage.error('获取收货地址失败');
        }
      }

      // 打开添加地址对话框
      function openAddAddressDialog() {
        isEditingAddress.value = false;
        addressForm.value = {
          address_id: '',
          receiver_name: '',
          phone_number: '',
          address: ''
        };
        showAddressEditDialog.value = true;
      }

      // 处理编辑地址
      function handleEditAddress(address) {
        console.log('Editing address:', address);  // 添加调试日志
        isEditingAddress.value = true;
        addressForm.value = {
          address_id: address.address_id,
          receiver_name: address.receiver_name,
          phone_number: address.phone_number,
          address: address.address
        };
        showAddressEditDialog.value = true;
      }

      // 处理删除地址
      function handleDeleteAddress(address) {
        ElMessageBox.confirm(
          '确定要删除这个收货地址吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(async () => {
          try {
            const response = await fetch("/user_profile", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'type': 'delete_address'
              },
              body: JSON.stringify({
                user_id: route.query.user_id,
                address_id: address.address_id
              })
            });

            if (!response.ok) throw new Error('删除地址失败');

            const data = await response.json();
            if (data.success) {
              ElMessage.success('删除成功');
              await fetchAddresses();
            }
          } catch (error) {
            console.error('Error deleting address:', error);
            ElMessage.error('删除失败');
          }
        }).catch(() => {});
      }

      // 提交地址表单
      async function submitAddress() {
        if (!addressFormRef.value) return;

        try {
          await addressFormRef.value.validate();
          console.log('Form data before submit:', addressForm.value);
          
          const response = await fetch("/user_profile", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': isEditingAddress.value ? 'update_address' : 'add_address'
            },
            body: JSON.stringify({
              user_id: route.query.user_id,
              address_id: addressForm.value.address_id,  // 添加 address_id 字段
              receiver_name: addressForm.value.receiver_name,
              phone_number: addressForm.value.phone_number,
              address: addressForm.value.address
            })
          });
          // 添加调试日志
          console.log('Request data:', response);

          if (!response.ok) throw new Error('保存地址失败');

          const data = await response.json();
          console.log("address data:", data);
          if (data.success) {
            ElMessage.success(isEditingAddress.value ? '修改成功' : '添加成功');
            showAddressEditDialog.value = false;
            fetchAddresses();
          } else {
            ElMessage.error(data.message || '保存失败');
          }
        } catch (error) {
          console.error('Error saving address:', error);
          ElMessage.error('保存失败，请稍后重试');
        }
      }
  
      const activeOrderTab = ref('bought');
      const boughtOrders = ref([]);
      const soldOrders = ref([]);

      // 格式化时间函数
      function formatTime(timeStr) {
        if (!timeStr) return '';
        
        try {
          const date = new Date(timeStr);  // 直接解析 GMT 格式的时间字符串
          const now = new Date();
          const diff = now - date;
          
          if (diff < 60000) { // 小于1分钟
            return '刚刚';
          } else if (diff < 3600000) { // 小于1小时
            return `${Math.floor(diff / 60000)}分钟前`;
          } else if (diff < 86400000) { // 小于24小时
            return `${Math.floor(diff / 3600000)}小时前`;
          } else {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          }
        } catch (error) {
          console.error('Error parsing date:', error, timeStr);
          return timeStr; // 如果解析失败，返回原始字符串
        }
      }

      // 获取订单列表
      async function fetchOrders() {
        try {
          const response = await fetch("/user_profile", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'type': 'get_orders'
            },
            body: JSON.stringify({
              user_id: route.query.user_id
            })
          });

          if (!response.ok) throw new Error('获取订单列表失败');

          const data = await response.json();
          console.log("Raw order data:", data);

          if (data.success) {
            // 处理已买到的订单
            boughtOrders.value = data.bought_orders
              .map(order => ({
                goods_id: order.goods_id,
                goods_name: order.goods_name,
                goods_price: order.goods_price,
                order_state: order.order_state,
                deal_time: order.deal_time,
                goods_picture: order.picture ? 
                  URL.createObjectURL(base64ToBlob(order.picture)) : defaultAvatar
              }))
              .sort((a, b) => new Date(b.deal_time) - new Date(a.deal_time)); // 按时间从新到旧排序
            
            // 处理已卖出的订单
            soldOrders.value = data.sold_orders
              .map(order => ({
                goods_id: order.goods_id,
                goods_name: order.goods_name,
                goods_price: order.goods_price,
                order_state: order.order_state,
                deal_time: order.deal_time,
                goods_picture: order.picture ? 
                  URL.createObjectURL(base64ToBlob(order.picture)) : defaultAvatar
              }))
              .sort((a, b) => new Date(b.deal_time) - new Date(a.deal_time)); // 按时间从新到旧排序
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          ElMessage.error('获取订单列表失败');
        }
      }

      // 跳转到订单详情
      function goToOrderDetails(order) {
        router.push({
          name: 'OrderDetails',
          params: { 
            orderId: order.goods_id
          },
          query: {
            current_user_id: route.query.current_user_id,
            userAvatar: route.query.userAvatar
          }
        });
      }

      // 获取订单状态文本
      function getOrderStatusText(status) {
        // 后端直接返回中文状态，直接返回即可
        return status || '未知状态';
      }

      // 确认送达
      async function confirmDelivery(goodsId) {
      try {
      const response = await fetch("/order_detail", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'type': 'confirm_delivery'
        },
          body: JSON.stringify({
          goods_id: goodsId,
          user_id: route.query.current_user_id
          })
        });
        if (!response.ok) throw new Error('确认送达失败');
        const data = await response.json();
        if (data.success) {
          ElMessage.success('确认送达成功');
          await fetchOrders(); // 重新获取订单列表
        }
        } catch (error) {
          console.error('Error confirming delivery:', error);
          ElMessage.error('确认送达失败');
        }
      }
      // 申请退款
      async function requestRefund(goodsId) {
      try {
      const response = await fetch("/order_detail", {
      method: "POST",
      headers: {
      'Content-Type': 'application/json',
      'type': 'request_refund'
      },
      body: JSON.stringify({
        goods_id: goodsId,
        user_id: route.query.current_user_id
      })
      });
      if (!response.ok) throw new Error('申请退款失败');
      const data = await response.json();
      if (data.success) {
        ElMessage.success('退款申请已提交');
        await fetchOrders(); // 重新获取订单列表
      }
      } catch (error) {
        console.error('Error requesting refund:', error);
        ElMessage.error('申请退款失败');
      }
      }

      const showChatDialog = ref(false);
      const chatForm = ref({
        content: ''
      });
      const chatRules = {
        content: [
          { required: true, message: '请输入消息内容', trigger: 'blur' }
        ]
      };

      // 打开聊天对话框
      function openChatDialog() {
        showChatDialog.value = true;
      }

      // 发送消息
      async function sendMessage() {
        if (!chatForm.value.content.trim()) {
          ElMessage.warning('请输入消息内容');
          return;
        }

        try {
          const response = await fetch("/user_profile", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'type': 'send_message'
            },
            body: JSON.stringify({
              sender_id: route.query.current_user_id,
              receiver_id: route.query.user_id,
              content: chatForm.value.content
            })
          });

          if (!response.ok) throw new Error('发送失败');

          const data = await response.json();
          if (data.success) {
            ElMessage.success('消息发送成功');
            showChatDialog.value = false;
            chatForm.value.content = '';
          } else {
            ElMessage.error(data.message || '发送失败');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          ElMessage.error('发送失败，请重试');
        }
      }

      // 订单分页相关的响应式变量
      const boughtOrdersCurrentPage = ref(1);
      const soldOrdersCurrentPage = ref(1);
      const ordersPageSize = 3; // 每页显示3个订单

      // 订单分页的计算属性
      const paginatedBoughtOrders = computed(() => {
        if (!boughtOrders.value) return [];
        const start = (boughtOrdersCurrentPage.value - 1) * ordersPageSize;
        const end = start + ordersPageSize;
        return boughtOrders.value.slice(start, end);
      });

      const paginatedSoldOrders = computed(() => {
        if (!soldOrders.value) return [];
        const start = (soldOrdersCurrentPage.value - 1) * ordersPageSize;
        const end = start + ordersPageSize;
        return soldOrders.value.slice(start, end);
      });

      // 处理订单分页变化
      function handleBoughtOrdersPageChange(page) {
        boughtOrdersCurrentPage.value = page;
      }

      function handleSoldOrdersPageChange(page) {
        soldOrdersCurrentPage.value = page;
      }

      onMounted(() => {
        fetchUserInfo();
        fetchUserGoods();
        fetchFavorites();
        
        fetchOrders();
        
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
        handleCollectChange,
        isCurrentUser,
        showReportDialog,
        reportFormRef,
        reportForm,
        reportRules,
        handleReport,
        handleCloseReport,
        submitReport,
        showAddressDialog,
        showAddressEditDialog,
        addresses,
        addressForm,
        addressFormRef,
        addressRules,
        addressDialogTitle,
        openAddressDialog,
        openAddAddressDialog,
        handleEditAddress,
        handleDeleteAddress,
        submitAddress,
        activeOrderTab,
        boughtOrders,
        soldOrders,
        goToOrderDetails,
        getOrderStatusText,
        formatTime,
        confirmDelivery,
        requestRefund,
        showChatDialog,
        chatForm,
        chatRules,
        openChatDialog,
        sendMessage,
        boughtOrdersCurrentPage,
        soldOrdersCurrentPage,
        ordersPageSize,
        paginatedBoughtOrders,
        paginatedSoldOrders,
        handleBoughtOrdersPageChange,
        handleSoldOrdersPageChange
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
  padding: 20px 0;
  border-top: 1px solid #eee;
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
  font-size: 14px;
  color: #666;
}

/* 与 GoodDetails 页面相同的举报按钮样式 */
.report-btn {
  margin-left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.report-btn .el-icon {
  margin-right: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding: 10px 0;
}

.button-group .el-button {
  width: 120px;
}

.chat-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.chat-btn .el-icon {
  font-size: 16px;
}

.address-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单列表样式 */
.orders-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 90%; /* 控制组件宽度，与页面两侧留有距离 */
  max-width: 1200px;
}

.section-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

.order-tabs {
  margin-top: 20px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.order-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.order-card:hover {
  transform: translateY(-5px);
}

.order-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.order-info {
  padding: 15px;
}

.order-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-price {
  margin: 10px 0;
  color: #ff5000;
  font-size: 18px;
  font-weight: bold;
}

.order-status {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.order-time {
  color: #999;
  font-size: 14px;
}

.order-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.order-actions .el-button {
  padding: 6px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .orders-section {
    width: 95%;
    padding: 15px;
  }
  
  .orders-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .order-info h3 {
    font-size: 14px;
  }
  
  .order-price {
    font-size: 16px;
  }
}

.no-orders {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
  width: 100%;
  background: #f9f9f9;
  border-radius: 8px;
}

.el-tabs {
  margin-top: 20px;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

:deep(.el-tabs__item.is-active) {
  color: #ff5000;
}

:deep(.el-tabs__active-bar) {
  background-color: #ff5000;
}

/* 响应式设计补充 */
@media (max-width: 768px) {
  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 15px;
  }
  
  .no-orders {
    padding: 30px 0;
    font-size: 13px;
  }
}
  </style>