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
              @click.stop
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
          
          <div v-if="goodsPictures.length > 1" class="image-counter">
            {{ currentImageIndex + 1 }}/{{ goodsPictures.length }}
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
          <div class="product-header">
            <h1 class="product-name">{{ goodsName }}</h1>
            <el-button 
              v-if="isOwner" 
              type="primary" 
              @click="showEditDialog = true"
              class="edit-button"
            >
              <el-icon><Edit /></el-icon>
              编辑商品
            </el-button>
          </div>
          <div class="product-price">¥{{ goodsPrice }}</div>
          
          <!-- 添加一个按钮容器 -->
          <div class="action-buttons-container">
            <!-- 收藏按钮 -->
            <el-button
              v-if="!isOwner"
              :type="isCollected ? 'warning' : 'default'"
              class="collect-button"
              @click="handleCollect"
            >
              <el-icon><Star :class="{ 'collected': isCollected }" /></el-icon>
              {{ isCollected ? '已收藏' : '收藏' }}
            </el-button>

            <!-- 购买按钮 -->
            <el-button
              v-if="!isOwner"
              type="primary"
              class="purchase-button"
              :disabled="isProcessing"
              @click="showAddressSelection"
            >
              <el-icon><ShoppingCart /></el-icon>
              {{ isProcessing ? '处理中...' : '现在下单' }}
            </el-button>
          </div>

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
        <div class="description-header">
          <h2>商品描述</h2>
          <el-button 
            type="danger" 
            size="small" 
            class="report-goods-btn"
            @click="handleReport('goods')"
          >
            <el-icon><Warning /></el-icon>
            举报商品
          </el-button>
        </div>
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
               :key="comment.comment_time" 
               class="comment-item"
          >
            <!-- 主评论 -->
            <div class="comment-main">
              <div class="comment-header">
                <div class="comment-user">
                  <img :src="comment.deliver_picture" :alt="comment.deliver_name" />
                  <span class="user-name">{{ comment.deliver_name }}</span>
                  <span class="comment-time">{{ comment.comment_time }}</span>
                </div>
                <el-button 
                  type="text" 
                  class="report-comment-btn"
                  @click="handleReport('comment', comment.goods_comment_id)"
                >
                  <el-icon><Warning /></el-icon>
                  举报
                </el-button>
              </div>
              <div class="comment-content">{{ comment.comment }}</div>
              <div class="comment-actions">
                <button 
                  class="action-btn like-btn" 
                  :class="{ 'active': getCommentAction(comment) === 'like' }"
                  @click="handleLike(comment)"
                >
                  <i class="fas fa-thumbs-up thumb-icon"></i>
                  <span class="count">{{ comment.helpful }}</span>
                </button>
                <button 
                  class="action-btn dislike-btn" 
                  :class="{ 'active': getCommentAction(comment) === 'dislike' }"
                  @click="handleDislike(comment)"
                >
                  <i class="fas fa-thumbs-down thumb-icon"></i>
                  <span class="count">{{ comment.unhelpful }}</span>
                </button>
                <button class="reply-btn" @click="handleReply(comment)">
                  {{ activeReplyId === comment.goods_comment_id ? '取消回复' : '回复' }}
                </button>
              </div>
            </div>

            <!-- 添加回复输入框 -->
            <div v-if="activeReplyId === comment.goods_comment_id" class="reply-input-container">
              <textarea 
                v-model="replyContent"
                placeholder="写下你的回复..."
                rows="2"
                class="reply-textarea"
              ></textarea>
              <div class="reply-actions">
                <button 
                  class="cancel-btn" 
                  @click="activeReplyId = null"
                >
                  取消
                </button>
                <button 
                  class="submit-btn" 
                  @click="submitReply(comment.goods_comment_id)"
                >
                  发送
                </button>
              </div>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.reply && comment.reply.length > 0" class="reply-list">
              <div v-for="reply in comment.reply" 
                   :key="reply.comment_time" 
                   class="reply-item"
              >
                <div class="reply-header">
                  <div class="comment-user">
                    <img :src="reply.deliver_picture" :alt="reply.deliver_name" />
                    <span class="user-name">{{ reply.deliver_name }}</span>
                    <span class="comment-time">{{ reply.comment_time }}</span>
                  </div>
                  <el-button 
                    type="text" 
                    class="report-reply-btn"
                    @click="handleReport('reply', comment.goods_comment_id, reply.second_goods_comment_id)"
                  >
                    <el-icon><Warning /></el-icon>
                    举报
                  </el-button>
                </div>
                <div class="comment-content">{{ reply.comment }}</div>
                <div class="comment-actions">
                  <button 
                    class="action-btn like-btn" 
                    :class="{ 'active': getCommentAction(reply) === 'like' }"
                    @click="handleLike(reply)"
                  >
                    <i class="fas fa-thumbs-up thumb-icon"></i>
                    <span class="count">{{ reply.helpful }}</span>
                  </button>
                  <button 
                    class="action-btn dislike-btn" 
                    :class="{ 'active': getCommentAction(reply) === 'dislike' }"
                    @click="handleDislike(reply)"
                  >
                    <i class="fas fa-thumbs-down thumb-icon"></i>
                    <span class="count">{{ reply.unhelpful }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 弹窗 -->
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

    <!-- 添加编辑商品的对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑商品信息"
      width="60%"
      :before-close="handleCloseEdit"
    >
      <el-form 
        :model="editForm" 
        :rules="editRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name" />
        </el-form-item>

        <el-form-item label="商品类别" prop="category_name">
          <el-select v-model="editForm.category_name" placeholder="请选择商品类别">
            <el-option label="体育运动" value="sport" />
            <el-option label="学习用品" value="study" />
            <el-option label="电子数码" value="digital" />
            <el-option label="衣物饰品" value="cloth" />
            <el-option label="其他类别" value="else" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品价格" prop="goods_price">
          <el-input-number 
            v-model="editForm.goods_price" 
            :precision="2" 
            :step="0.1" 
            :min="0" 
          >
            <template #suffix>元</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="商品描述" prop="goods_description">
          <el-input 
            type="textarea" 
            v-model="editForm.goods_description" 
            rows="4"
          />
        </el-form-item>

        <el-form-item label="商品状态" prop="goods_state">
          <el-select v-model="editForm.goods_state" placeholder="请选择商品状态">
            <el-option label="在售" value="on_sale" />
            <el-option label="已售出" value="sold" />
            <el-option label="下架" value="removed" />
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
            :on-preview="handlePreview" 
            :before-upload="beforeUpload"
            :file-list="fileList"
            multiple
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <!-- 添加图片预览组件 -->
      <el-image-viewer
        v-if="showViewer"
        :url-list="fileList.map(file => file.url)"
        :initial-index="previewIndex"
        @close="showViewer = false"
      />
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

    <!-- 添加举报对话框 -->
    <el-dialog
      v-model="showReportDialog"
      title="举报"
      width="30%"
      :before-close="handleCloseReport"
    >
      <el-form :model="reportForm" ref="reportFormRef">
        <el-form-item 
          label="举报理由" 
          prop="content"
          :rules="[{ required: true, message: '请填写举报理由', trigger: 'blur' }]"
        >
          <el-input
            v-model="reportForm.content"
            type="textarea"
            rows="4"
            placeholder="请详细描述举报原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseReport">取消</el-button>
          <el-button type="danger" @click="submitReport">提交举报</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加地址选择对话框 -->
    <el-dialog
      v-model="showAddressDialog"
      title="选择收货地址"
      width="50%"
    >
      <el-table
        :data="addressList"
        style="width: 100%"
        highlight-current-row
        @current-change="handleAddressSelect"
      >
        <el-table-column
          prop="receiver_name"
          label="收货人"
          width="120"
        />
        <el-table-column
          prop="phone_number"
          label="联系电话"
          width="150"
        />
        <el-table-column
          prop="address"
          label="收货地址"
        />
      </el-table>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddressDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmOrder"
            :disabled="!selectedAddress"
          >
            确认下单
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ElImageViewer } from 'element-plus';

import { useRoute } from 'vue-router';
import defaultAvatar from '@/assets/tubiao.png';
import lanqiuImage from '@/assets/lanqiu.png';
import xuexiImage from '@/assets/xuexi.png';
import shumaImage from '@/assets/shuma.png';
import yiwuImage from '@/assets/yifu.png';
import qitaImage from '@/assets/qita.png';
import { 
  Bell, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Calendar, 
  Phone, 
  Position,     // 使用 Position 图标来模拇指
  Edit, 
  Plus,
  ShoppingCart,
  Warning
} from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { ElDialog } from 'element-plus';
import { ElMessage } from 'element-plus';

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
    Position,    // 注册 Position 组件
    Edit, 
    Plus,
    ShoppingCart,
    Warning,
    ElImageViewer
  },
  setup({ emit }) {
    const route = useRoute();
    const userAvatar = ref(route.query.userAvatar || defaultAvatar);
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
    const commentActions = ref(new Map()); // 用于存储用户对每条评论的操作状态

    const uploadUrl = '/goods_picture_show';

    // 添加回复相关的响应式变量
    const activeReplyId = ref(null);  // 当前正在回复的评论ID
    const replyContent = ref('');     // 回复内容

    // 添加二级评论数组
    const secondLevelComments = ref([]);

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
    async function fetchAnnouncements(){
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
          { id: 1, title: "系统提示", content: "暂时没有新公告", date: new Date().toLocaleDateString() }
        ];
        showAnnouncementDialog.value = true;
      }
    }

    // 获取评论函数
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
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        
        // 处理评论数据中的头像，同时添加 level 字段
        const processedComments = data.map(comment => {
          // 处理一级评论头像并添加 level
          const processedComment = {
            ...comment,
            level: 1,  // 添加一级评论标识
            deliver_picture: comment.deliver_picture ? 
              URL.createObjectURL(base64ToBlob(comment.deliver_picture)) : 
              defaultAvatar
          };

          // 处理二级评论头像并添加 level
          if (comment.reply && Array.isArray(comment.reply)) {
            processedComment.reply = comment.reply.map(reply => ({
              ...reply,
              level: 2,  // 添加二级评论标识
              deliver_picture: reply.deliver_picture ? 
                URL.createObjectURL(base64ToBlob(reply.deliver_picture)) : 
                defaultAvatar
            }));

            // 更新二级评论数组时也带上 level
            secondLevelComments.value = [
              ...secondLevelComments.value,
              ...comment.reply.map(reply => ({
                ...reply,
                level: 2,  // 添加二级评论标识
                parent_comment_id: comment.goods_comment_id,
                parent_comment_content: comment.comment,
                parent_user_name: comment.deliver_name
              }))
            ];
          }

          return processedComment;
        });

        comments.value = processedComments;
        
        // 按时间排序二级评论
        secondLevelComments.value.sort((a, b) => 
          new Date(b.comment_time) - new Date(a.comment_time)
        );
        
      } catch (error) {
        console.error('Error fetching comments:', error);
        // 设置默认评论数据时也添加 level
        comments.value = [
          {
            comment: "这是一条测试评论",
            goods_comment_id: 1,
            comment_time: "2024-03-20 10:00",
            helpful: 12,
            unhelpful: 3,
            deliver_name: "测试用户1",
            deliver_picture: defaultAvatar,
            level: 1,  // 添加一级评论标识
            reply: [
              {
                comment: "这是一条回复",
                second_goods_comment_id: 1,
                comment_time: "2024-03-20 10:30",
                helpful: 5,
                unhelpful: 1,
                deliver_name: "测试用户2",
                deliver_picture: defaultAvatar,
                level: 2  // 添加二级评论标识
              }
            ]
          }
        ];
      }
    }

    // 提交评
    async function submitComment() {
      if (!newComment.value.trim()) {
        ElMessage.warning('评论内容不能为空');
        return;
      }
      
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'commit_comment'
          },
          body: JSON.stringify({
            goods_id: route.params.productId,
            comment: newComment.value,
            deliver_id: route.query.current_user_id
          })
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('评论发表成功！');
          await fetchComments(); // 重新获取评论列表
          newComment.value = ''; // 清空入框
        } else {
          ElMessage.error('论发表失败重试');
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        ElMessage.error('评论发表失败，请稍后重试');
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

    // 在 setup() 函数中添加获取商品情函数
    async function fetchGoodsDetail() {
      try {
        console.log("发送请求，商品ID:", route.params.productId);
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'detail'
          },
          body: JSON.stringify({
            goods_id: route.params.productId,
            user_id: route.query.current_user_id  // 添加用户ID
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch goods detail');
        }

        const data = await response.json();
        console.log("获取到商品详情数据：", data);

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
        
        // 更新收藏状态
        isCollected.value = data.collected;

      } catch (error) {
        console.error('Error fetching goods detail:', error);
        
        // 设置默认数据
        goodsPictures.value = [lanqiuImage, xuexiImage, shumaImage, yiwuImage, qitaImage];
        goodsName.value = route.query.name || '测试商品';
        goodsPrice.value = route.query.price || '99.99';
        goodsDescription.value = '这是一个测试商品描述，用于调试多图片展示效果。';
        sellerName.value = '测试卖家';
        sellerPicture.value = defaultAvatar;
        heat.value = Math.floor(Math.random() * 951) + 50;
        
        // 生成最近7天内的随机日期
        const today = new Date();
        const randomDays = Math.floor(Math.random() * 7);
        today.setDate(today.getDate() - randomDays);
        beginTime.value = today.toISOString().split('T')[0];
        
        // 默认未收藏
        isCollected.value = false;
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

    // 修改判断函数，使用更可靠的方式来区分评论层级
    function isSecondLevelComment(comment) {
      return comment.level === 2;  // 直接使用 level 字段判断
    }

    // 修改获取评论ID的函数
    function getCommentId(comment) {
      return comment.level === 2 ? 
        `reply_${comment.second_goods_comment_id}` : 
        `comment_${comment.goods_comment_id}`;
    }

    // 修改获取评论操作状态的函数
    function getCommentAction(comment) {
      const commentId = getCommentId(comment);
      return commentActions.value.get(commentId) || null;
    }

    // 修改点赞函数中的ID处理
    async function handleLike(comment) {
      const commentId = getCommentId(comment);
      const level = isSecondLevelComment(comment) ? 2 : 1;
      const rawId = isSecondLevelComment(comment) ? comment.second_goods_comment_id : comment.goods_comment_id;
      const currentAction = commentActions.value.get(commentId);

      // 如果已经点赞，这次是取消点赞
      if (currentAction === 'like') {
        try {
          const response = await fetch("/goods_detail", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'type': 'like'
            },
            body: JSON.stringify({
              like: true,
              level: level,
              id: rawId,  // 使用原始ID
              cancel: currentAction === 'like'
            })
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          if (data.success) {
            comment.helpful -= 1;  // 减少点赞数
            commentActions.value.delete(commentId);  // 删除操作状态
            ElMessage.success('已取消点赞');
          } else {
            ElMessage.error('操作失败');
          }
        } catch (error) {
          console.error('Error handling like:', error);
          ElMessage.error('操作失败，请稍后重试');
        }
        return;
      }

      // 如果已经点踩，不允许点赞
      if (currentAction === 'dislike') {
        ElMessage.warning('您已经点过踩了，如需点赞请先取消点踩');
        return;
      }

      // 正常点赞操作
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'like'
          },
          body: JSON.stringify({
            like: true,
            level: level,
            id: rawId,  // 使用原始ID
            cancel: false  // 添加正常操作标记
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
          comment.helpful += 1;
          commentActions.value.set(commentId, 'like');
          ElMessage.success('点赞成功');
        } else {
          ElMessage.error('点赞失败');
        }
      } catch (error) {
        console.error('Error handling like:', error);
        ElMessage.error('操作失败，请稍后重试');
      }
    }

    // 同样修改点踩函数
    async function handleDislike(comment) {
      const commentId = getCommentId(comment);
      const level = isSecondLevelComment(comment) ? 2 : 1;
      const rawId = isSecondLevelComment(comment) ? comment.second_goods_comment_id : comment.goods_comment_id;
      const currentAction = commentActions.value.get(commentId);

      // 如果已经点踩，这次是取消点踩
      if (currentAction === 'dislike') {
        try {
          const response = await fetch("/goods_detail", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'type': 'like'
            },
            body: JSON.stringify({
              like: false,
              level: level,
              id: rawId,  // 用原始ID
              cancel: currentAction === 'dislike'
            })
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          if (data.success) {
            comment.unhelpful -= 1;  // 减少点踩数
            commentActions.value.delete(commentId);  // 删除操作状态
            ElMessage.success('已取消点踩');
          } else {
            ElMessage.error('操作失败');
          }
        } catch (error) {
          console.error('Error handling dislike:', error);
          ElMessage.error('操作失败，请稍后重试');
        }
        return;
      }

      // 如果已经点赞，不允许点踩
      if (currentAction === 'like') {
        ElMessage.warning('您已经点过赞了，如需点踩请先取消点赞');
        return;
      }

      // 正常点踩操作
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'like'
          },
          body: JSON.stringify({
            like: false,
            level: level,
            id: rawId,  // 使用原始ID
            cancel: false  // 添加正常操作标记
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
          comment.unhelpful += 1;
          commentActions.value.set(commentId, 'dislike');
          ElMessage.success('点踩成功');
        } else {
          ElMessage.error('点踩失败');
        }
      } catch (error) {
        console.error('Error handling dislike:', error);
        ElMessage.error('操作失败，请稍后重试');
      }
    }

    // 修改处理回复的函数
    function handleReply(comment) {
      // 如果点击的是当前已经打开的回复框，则关闭它
      if (activeReplyId.value === comment.goods_comment_id) {
        activeReplyId.value = null;
        replyContent.value = '';
      } else {
        // 否则打开新的回复框
        activeReplyId.value = comment.goods_comment_id;
        replyContent.value = '';
      }
    }

    // 添加提交回复的函数
    async function submitReply(commentId) {
      if (!replyContent.value.trim()) {
        ElMessage.warning('回复内容不能为空');
        return;
      }

      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'commit_reply'
          },
          body: JSON.stringify({
            goods_comment_id: commentId,
            second_goods_comment: replyContent.value,
            deliver_id: route.query.current_user_id
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.success) {
          ElMessage.success('回复成功');
          // 清空回复框并关闭
          replyContent.value = '';
          activeReplyId.value = null;
          // 重新获取评论列表
          await fetchComments();
        } else {
          ElMessage.error('回复失败，请重试');
        }
      } catch (error) {
        console.error('Error submitting reply:', error);
        ElMessage.error('回复失败，请稍后重试');
      }
    }

    // 添加新的响应式变量
    const showEditDialog = ref(false);
    const editFormRef = ref(null);
    const isOwner = ref(route.query.isOwner === 'true');
    const fileList = ref([]);

    function handleRemove(file) {
      console.log("file:", file);
      console.log("editForm.goods_pictures:", editForm.value.goods_pictures);
      // 将被删除的图片记录到deleted_pictures中
      const index = fileList.value.findIndex(f => f.uid === file.uid);
      console.log("index:", index);
      if (index !== -1) {
        editForm.value.deleted_pictures.push(editForm.value.pictures_type[index]);
        fileList.value.splice(index, 1);
        editForm.value.goods_pictures.splice(index, 1);
        editForm.value.pictures_type.splice(index, 1);
      }
      console.log("editForm.goods_pictures:", editForm.value.goods_pictures);
    }
    
    const editForm = ref({
      goods_name: '',
      category_name: '',
      goods_price: 0,
      goods_description: '',
      goods_state: '',
      goods_pictures: [],
      pictures_type: [],
      deleted_pictures: []
    });

    const editRules = {
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
        if (!editForm.value.goods_pictures || editForm.value.goods_pictures.length === 0) {
          callback(new Error('请至少上传一张商品图片'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
    };

    // 初始化编辑表单
    //TODO
    async function initEditForm() {
      try {
    // 发送请求获取商品详细信息
    const response = await fetch("/goods_detail", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'type': 'detail'  // 用于后端识别请求类型
      },
      body: JSON.stringify({
        goods_id: route.params.productId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch goods detail');
    }

    const data = await response.json();
    
    if (true) {
      // 使用后端返回的数据初始化表单
      editForm.value = {
        goods_name: data.goods_name,
        category_name: data.category_name,
        goods_price: parseFloat(data.goods_price),
        goods_description: data.goods_description,
        goods_state: data.goods_state,
        goods_pictures: [],  // 初始化空数组
        pictures_type:  [],
        deleted_pictures: []
      };
      console.log("editForm.value:", editForm.value);

      // 如果后端返回了图片数据，处理图片
      if (Array.isArray(data.goods_pictures) && Array.isArray(data.pictures_type)) {
        // 将base64图片数据转换为文件列表
        fileList.value = data.goods_pictures.map((pic, index) => ({
          name: data.pictures_type[index],
          url: URL.createObjectURL(base64ToBlob(pic))
        }));
        
        // 保存图片数据到表单
        editForm.value.goods_pictures = data.goods_pictures;
        // 保存图片文件名到表单
        editForm.value.pictures_type = data.pictures_type;
      }

      ElMessage.success('商品信息加载成功');
    } else {
      throw new Error(data.message || '获取商品信息失败');
    }
  } catch (error) {
    console.error('Error initializing edit form:', error);
        ElMessage.error('加载商品信息失败，请重试');
      }
    }

    // 处理图片上传
    function handleUploadSuccess(response, file) {
      console.log("Upload success - file:", file);
      console.log("Upload success - response:", response);
      if (response.success) {
        fileList.value.push({
          name: file.name,
          url: URL.createObjectURL(file.raw),
          uid: file.uid
        });
        //console.log("response.url:", response.url);
        editForm.value.goods_pictures.push(response.url);
        // 保存图片文件名到表单
        //console.log("file.name:", file.name);
        editForm.value.pictures_type.push(file.name);
        console.log("fileList.value:", fileList.value);
        console.log("After upload - goods_pictures:", editForm.value.goods_pictures);
        console.log("After upload - pictures_type:", editForm.value.pictures_type);
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error(response.message || '上传失败');
      }
    }

    function handleUploadError() {
      ElMessage.error('图片上传失败');
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

    // 提交编辑
    async function submitEdit() {
      if (!editFormRef.value) return;
      
      try {
        await editFormRef.value.validate();
        //const pictures_type = fileList.value.map(file => file.name);
        
        const response = await fetch("/goods_detail", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'type': 'update_goods'
          },
          body: JSON.stringify({
            //goods_id: route.params.productId,
            info: {
              goods_id: route.params.productId,
              goods_name: editForm.value.goods_name,
              category_name: editForm.value.category_name,
              goods_price: editForm.value.goods_price,
              goods_description: editForm.value.goods_description,
              goods_state: editForm.value.goods_state,
              goods_pictures: editForm.value.goods_pictures,
              pictures_type: editForm.value.pictures_type,
              deleted_pictures: editForm.value.deleted_pictures
            }
          })
        });
        console.log("editForm.value:", editForm.value);
        console.log("response:", response);
        if (!response.ok) throw new Error('更新失败');

        const data = await response.json();
        if (data.success) {
          ElMessage.success('商品信息更新成功');
          showEditDialog.value = false;
          // 刷新商品信息
          await fetchGoodsDetail();
        } else {
          ElMessage.error(data.message || '更新失败');
        }
      } catch (error) {
        console.error('Error updating product:', error);
        ElMessage.error('保存失败，请重试');
      }
    }

    function handleCloseEdit() {
      editFormRef.value?.resetFields();
      showEditDialog.value = false;
    }

    // 添加订单处理相关的响应式变量
    const isProcessing = ref(false);
    
    // 添加地址相关的响应式变量
    const showAddressDialog = ref(false);
    const addressList = ref([]);
    const selectedAddress = ref(null);
    
    // 显示地址选择对话框并获取地址列表
    async function showAddressSelection() {
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'getaddress'
          },
          body: JSON.stringify({
            buyer_id: route.query.current_user_id
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch addresses');
        }

        const data = await response.json();
        addressList.value = data;
        showAddressDialog.value = true;
      } catch (error) {
        console.error('Error fetching addresses:', error);
        ElMessage.error('获取地址列表失败，请重试');
      }
    }

    // 处理地址选
    function handleAddressSelect(address) {
      selectedAddress.value = address;
    }

    // 修改购买处理函数
    async function confirmOrder() {
      if (!selectedAddress.value) {
        ElMessage.warning('请选择收货地址');
        return;
      }
      
      if (isProcessing.value) return;
      
      try {
        isProcessing.value = true;
        
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'createorder'
          },
          body: JSON.stringify({
            goods_id: route.params.productId,
            buyer_id: route.query.current_user_id,
            address_id: selectedAddress.value.address_id
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('下单成功！');
          showAddressDialog.value = false;
          // 可以在这里添加跳转到订单页面或其他后续操作
        } else {
          ElMessage.error('下单失败，请重试');
        }
      } catch (error) {
        console.error('Error creating order:', error);
        ElMessage.error('下单失败，请稍后重试');
      } finally {
        isProcessing.value = false;
      }
    }

    // 添加收藏状态变量
    const isCollected = ref(false);
    
    // 修改收藏处理函数
    async function handleCollect() {
      try {
        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'collect'
          },
          body: JSON.stringify({
            goods_id: route.params.productId,
            user_id: route.query.current_user_id,
            collect: !isCollected.value
          })
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data.success) {
          isCollected.value = !isCollected.value;
          ElMessage.success(isCollected.value ? '收藏成功' : '已取消收藏');
          // 触发一个自定义事件，通知父组件收藏状态已更改
        emit('collect-changed', {
          goods_id: route.params.productId,
          collected: isCollected.value
        });
        } else {
          ElMessage.error('操作失败，请重试');
        }


      } catch (error) {
        console.error('Error toggling collect:', error);
        ElMessage.error('网络错误，请稍后重试');
      }
    }

    // 添加举报相关的响应式变量
    const showReportDialog = ref(false);
    const reportFormRef = ref(null);
    const reportForm = ref({
      content: '',
      type: '', // 'goods', 'comment', 'reply'
      goods_comment_id: null,
      second_goods_comment_id: null
    });

    // 处理举报
    function handleReport(type, commentId = null, replyId = null) {
      reportForm.value = {
        content: '',
        type,
        goods_comment_id: commentId,
        second_goods_comment_id: replyId
      };
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
        
        const reportData = {
          accuser_id: parseInt(route.query.current_user_id),
          content: reportForm.value.content
        };

        // 根据举报类型添加相应的ID
        if (reportForm.value.type === 'goods') {
          reportData.accused_goods_id = route.params.productId;
        } else if (reportForm.value.type === 'comment') {
          reportData.goods_comment_id = reportForm.value.goods_comment_id;
        } else if (reportForm.value.type === 'reply') {
          reportData.second_goods_comment_id = reportForm.value.second_goods_comment_id;
        }

        const response = await fetch("/goods_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'accuse'
          },
          body: JSON.stringify(reportData)
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

    onMounted(() => {
      // console.log("组件已挂载");
      document.addEventListener('click', closeDropdown);
      console.log("开始调用 fetchGoodsDetail");
      fetchGoodsDetail();
      fetchComments();
      if (isOwner.value) {
        initEditForm();
      }
    });

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdown);
    });

    const previewUrl = ref('');
    const showViewer = ref(false);
    const imagePreview = ref(null);
    const previewIndex = ref(0);

    // 修改 el-upload 的 onPreview 处理函数
    function handlePreview(file) {
      //previewUrl.value = file.url;
      previewIndex.value = fileList.value.findIndex(f => f.uid === file.uid);
      showViewer.value = true;
    }

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
      handleLike,
      handleDislike,
      handleReply,
      getCommentAction,
      activeReplyId,
      replyContent,
      submitReply,
      secondLevelComments,
      showEditDialog,
      editFormRef,
      editForm,
      editRules,
      isOwner,
      fileList,
      handleUploadSuccess,
      handleUploadError,
      beforeUpload,
      submitEdit,
      handleCloseEdit,
      initEditForm,
      uploadUrl,
      handleRemove,
      isProcessing,
      showAddressDialog,
      addressList,
      selectedAddress,
      showAddressSelection,
      handleAddressSelect,
      confirmOrder,
      isCollected,
      handleCollect,
      showReportDialog,
      reportFormRef,
      reportForm,
      handleReport,
      handleCloseReport,
      submitReport,
      previewUrl,
      imagePreview,
      handlePreview,
      showViewer,
      previewIndex
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
  min-width: 150px;
  margin-top: 8px;
  border: 1px solid #eee;
  z-index: 1001;
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

.image-counter {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 14px;
  z-index: 2;
}

.comment-main {
  padding: 15px;
  background: #f8f8f8;
  border-radius: 4px;
}

.comment-actions {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  color: #ff5000;
}

.action-btn .count {
  font-size: 12px;
}

.reply-list {
  margin-left: 40px;
  margin-top: 10px;
  padding-left: 15px;
  border-left: 2px solid #eee;
}

.reply-item {
  margin-bottom: 15px;
}

.like-btn {
  color: #666;  /* 默认颜色 */
  transition: all 0.3s;
  padding: 6px 12px;
  border-radius: 4px;
}

.like-btn:hover {
  color: #67c23a;  /* 悬停时的绿色 */
  background-color: rgba(103, 194, 58, 0.1);
}

.like-btn:hover .thumb-icon {
  transform: scale(1.2);
}

.dislike-btn {
  color: #666;  /* 默认颜色 */
  transition: all 0.3s;
  padding: 6px 12px;
  border-radius: 4px;
}

.dislike-btn:hover {
  color: #f56c6c;  /* 悬停时的红色 */
  background-color: rgba(245, 108, 108, 0.1);
}

.dislike-btn:hover .thumb-icon {
  transform: scale(1.2);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn .count {
  font-size: 14px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

/* 可以添加实心拇指的样式 */
.action-btn.active .fa-thumbs-up,
.action-btn.active .fa-thumbs-down {
  font-weight: 900;  /* 使用实心图标 */
}

.thumb-icon {
  font-size: 18px;
  transition: transform 0.3s;
}

.reply-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  color: #999;  /* 使用柔和的灰色 */
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.reply-btn:hover {
  color: #ff5000;  /* 悬停时变为主题色 */
  background-color: transparent;  /* 移除背景色 */
}

/* 移除可能存在的边框和阴影 */
.reply-btn:focus {
  outline: none;
}

.comment-actions {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  align-items: center;  /* 确保所有按钮垂直对齐 */
}

.like-btn.active {
  color: #67c23a !important;  /* 点赞后的绿色 */
}

.dislike-btn.active {
  color: #f56c6c !important;  /* 点踩后的红色 */
}

.action-btn.active .thumb-icon {
  transform: scale(1.2);
}

.reply-input-container {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
}

.reply-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 6px 12px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
}

.submit-btn {
  padding: 6px 16px;
  border: none;
  background: #ff5000;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.submit-btn:hover {
  background: #ff6a00;
}

.cancel-btn:hover {
  color: #666;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.goods-uploader {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
}

.purchase-button {
  width: 100%;
  height: 50px;
  margin: 20px 0;
  background: linear-gradient(135deg, #ff6a00, #ff5000);
  border: none;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 80, 0, 0.2);
}

.purchase-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 80, 0, 0.3);
  background: linear-gradient(135deg, #ff7a00, #ff6000);
}

.purchase-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(255, 80, 0, 0.2);
}

.purchase-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.purchase-button .el-icon {
  font-size: 20px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.collect-button {
  width: 100%;
  height: 45px;
  margin: 10px 0;
  border: 2px solid #ffd04b;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.collect-button:hover {
  background-color: #fdf6ec;
  transform: translateY(-1px);
}

.collect-button .el-icon {
  font-size: 20px;
  transition: all 0.3s ease;
}

.collect-button .collected {
  color: #e6a23c;
  animation: star-bounce 0.5s ease;
}

@keyframes star-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 调整购买按钮的margin,让两个按钮之间有合适的间距 */
.purchase-button {
  margin: 10px 0 20px;
}

/* 添加按钮容器样式 */
.action-buttons-container {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

/* 修改收藏按钮样式 */
.collect-button {
  flex: 1;
  height: 50px; /* 与购买按钮保持相同高度 */
  border: 2px solid #ffd04b;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin: 0; /* 移除原有的margin */
}

/* 修改购买按钮样式 */
.purchase-button {
  flex: 1;
  height: 50px;
  background: linear-gradient(135deg, #ff6a00, #ff5000);
  border: none;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 80, 0, 0.2);
  margin: 0; /* 移除原有的margin */
}

.description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.report-goods-btn {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.report-comment-btn,
.report-reply-btn {
  color: #909399;
  padding: 4px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.report-comment-btn:hover,
.report-reply-btn:hover {
  color: #f56c6c;
}

.comment-header,
.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-icon {
  margin-right: 4px;
}

/* 自定义表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row.current-row) {
  background-color: #fdf6ec;
}
</style> 