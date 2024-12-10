<template>
    <div class="order-details-view">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="nav-container">
        <div class="welcome-text">欢迎使用二手交易平台</div>
        
        <div class="user-section">
          <!-- <button class="announcement-btn" @click="fetchAnnouncements">
            <el-icon><Bell /></el-icon>
          </button> -->
          
          <div class="user-profile" @click.stop>
            <!-- <img 
              :src="userAvatar" 
              alt="用户头像" 
              class="avatar" 
              @click="toggleDropdown"
            /> -->
            <div 
              v-if="dropdownVisible" 
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
  <div class="good-details">
    <!-- 商品基本信息部分 -->
    <div class="good-info">
      <div class="good-images">
        <el-carousel height="400px">
          <el-carousel-item v-for="(url, index) in goodsDetail.goods_pictures" :key="index">
            <img :src="url" :alt="`商品图片${index + 1}`" class="carousel-image"/>
          </el-carousel-item>
        </el-carousel>
      </div>
      
      <div class="good-details-info">
        <h1>{{ goodsDetail?.goods_name }}</h1>
        <div class="price">¥{{ goodsDetail?.goods_price }}</div>
        <div class="deal-time">下单时间：{{ formatTime(orderDetail?.deal_time) }}</div>
        <div class="seller-info">
          <img :src="sellerPicture" alt="卖家头像" class="seller-avatar" />
          <button class="contact-btn" @click="contactSeller">
            <el-icon><Phone /></el-icon>
            <span>联系卖家</span>
          </button>
        </div>
        
        <!-- 订单状态和操作按钮 -->
        <div class="order-actions">
          <div class="order-status">
            订单状态：{{ getOrderStatusText(orderDetail.order_state) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 商品描述 -->
    <div class="good-description">
      <h2>商品描述</h2>
      <p>{{ goodsDetail?.goods_description }}</p>
    </div>

    <!-- 评价区域 -->
    <div class="comments-section">
      <h2>评价区</h2>
      
      <!-- 发表评论 -->
      <div class="comment-input">
        <!-- 添加评星组件 -->
        <div class="rating-section">
          <span class="rating-label">评分：</span>
          <el-rate
            v-model="commentRating"
            :colors="['#FF9900', '#FF9900', '#FF9900']"
            :texts="['1星', '2星', '3星', '4星', '5星']"
            show-text
          />
        </div>
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="说说你的想法..."
        />
        <el-button 
          type="primary" 
          @click="submitComment" 
          :disabled="!newComment.trim() || !commentRating"
        >
          发表评论
        </el-button>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.order_comment_id" class="comment-item">
          <!-- 一级评论 -->
          <div class="comment-main">
            <img :src="comment.deliver_picture" alt="用户头像" class="comment-avatar"/>
            <div class="comment-content">
              <div class="comment-header">
                <div class="comment-user">{{ comment.deliver_name }}</div>
                <div class="comment-rating">
                  <el-rate
                    v-model="comment.order_grade"
                    disabled
                    show-score
                    text-color="#ff9900"
                    :colors="['#FF9900', '#FF9900', '#FF9900']"
                  />
                </div>
              </div>
              <div class="comment-text">{{ comment.comment }}</div>
              <div class="comment-footer">
                <span class="comment-time">{{ formatTime(comment.comment_time) }}</span>
                <div class="comment-actions">
                  <button 
                    class="action-btn reply-btn" 
                    @click="toggleReply(comment)"
                  >
                    {{ activeReplyId === comment.order_comment_id ? '取消回复' : '回复' }}
                  </button>
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
                </div>
              </div>
            </div>
          </div>

          <!-- 添加回复输入框 -->
          <div v-if="activeReplyId === comment.order_comment_id" class="reply-input-container">
            <textarea 
              v-model="replyContent"
              placeholder="写下你的回复..."
              rows="2"
              class="reply-textarea"
            ></textarea>
            <div class="reply-actions">
              <button class="cancel-btn" @click="toggleReply(comment)">取消</button>
              <button class="submit-btn" @click="submitReply(comment.order_comment_id)">发送</button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.reply && comment.reply.length > 0" class="reply-list">
            <div v-for="reply in comment.reply" 
                 :key="reply.secondary_order_comment_id" 
                 class="reply-item"
            >
              <img :src="reply.deliver_picture" alt="用户头像" class="comment-avatar"/>
              <div class="comment-content">
                <div class="comment-user">{{ reply.deliver_name }}</div>
                <div class="comment-text">{{ reply.comment }}</div>
                <div class="comment-footer">
                  <span class="comment-time">{{ formatTime(reply.comment_time) }}</span>
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
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import defaultAvatar from '@/assets/tubiao.png'; // 导入默认头像图片
import { Bell, Camera, Plus, Warning, Phone } from '@element-plus/icons-vue';

import { ElImageViewer } from 'element-plus';

export default {
  components: {
    Bell,
    Phone
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const goodsDetail = ref({});
    const orderDetail = ref({});
    const sellerPicture = ref('');
    const dropdownVisible = ref(false);
    const userAvatar = ref(route.query.userAvatar || defaultAvatar);
    // 下拉菜单相关函数
    function toggleDropdown(event) {
      event.stopPropagation(); // 阻止事件冒泡
      dropdownVisible.value = !dropdownVisible.value;
    }

    function closeDropdown(event) {
      const userProfile = event.target.closest('.user-profile');
      if (!userProfile) {
        dropdownVisible.value = false;
      }
    }

    function viewProfile() {
      router.push({
        name: 'UserProfile',
        query: {
          user_id: route.query.current_user_id,
          current_user_id: route.query.current_user_id,
          userAvatar: route.query.userAvatar,
          viewing_own_profile: 'true'
        }
      });
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

    // 计算属性：是否可以申请退款
    const canRequestRefund = computed(() => {
      return ['已下单', '已送达'].includes(orderDetail.value.order_state);
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

    // 获取订单详情
    async function fetchOrderDetail() {
      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'get_order_detail'
          },
          body: JSON.stringify({
            goods_id: route.params.orderId,
            user_id: route.query.current_user_id
          })
        });

        if (!response.ok) throw new Error('获取订单详情失败');

        const data = await response.json();
        console.log(data);
        if (data.success) {
          orderDetail.value = data.order_detail;
          console.log(orderDetail.value);
          
          // 处理商品详情和图片
          goodsDetail.value = {
            ...data.goods_detail,
            goods_pictures: data.goods_detail.goods_pictures.map(picture => {
              if (picture && typeof picture === 'string') {
                try {
                  return URL.createObjectURL(base64ToBlob(picture));
                } catch (error) {
                  console.error('Error converting picture:', error);
                  return defaultAvatar;
                }
              }
              return defaultAvatar;
            })
          };

          // 处理卖家头像
          sellerPicture.value = data.goods_detail.seller_picture ? 
            URL.createObjectURL(base64ToBlob(data.goods_detail.seller_picture)) : defaultAvatar;
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        ElMessage.error('获取订单详情失败');
      }
    }

    // 确认送达
    async function confirmDelivery() {
      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'confirm_delivery'
          },
          body: JSON.stringify({
            goods_id: route.params.orderId,
            user_id: route.query.current_user_id
          })
        });

        if (!response.ok) throw new Error('确认送达失败');

        const data = await response.json();
        if (data.success) {
          ElMessage.success('确认送达成功');
          orderDetail.value.order_state = '已送达';
        }
      } catch (error) {
        console.error('Error confirming delivery:', error);
        ElMessage.error('确认送达失败');
      }
    }

    // 申请退款
    async function requestRefund() {
      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'request_refund'
          },
          body: JSON.stringify({
            goods_id: route.params.orderId,
            user_id: route.query.current_user_id
          })
        });

        if (!response.ok) throw new Error('申请退款失败');

        const data = await response.json();
        if (data.success) {
          ElMessage.success('退款申请已提交');
          orderDetail.value.order_state = '已退款';
        }
      } catch (error) {
        console.error('Error requesting refund:', error);
        ElMessage.error('申请退款失败');
      }
    }

    // 获取订单状态文本
    function getOrderStatusText(status) {
      return status || '未知状态';
    }

    // 联系卖家
    function contactSeller() {
      router.push({
        name: 'UserProfile',
        query: {
          user_id: goodsDetail.value.seller_id,
          current_user_id: route.query.current_user_id,
          userAvatar: sellerPicture.value,
          isOwner: false,
          viewing_own_profile: 'false'
        }
      });
    }

    // 评论相关的响应式变量
    const comments = ref([]);
    const newComment = ref('');
    const commentActions = ref(new Map()); // 用于存储用户对每条评论的操作状态
    const activeReplyId = ref(null);  // 当前正在回复的评论ID
    const replyContent = ref('');     // 回复内容
    const commentRating = ref(0);  // 评分，默认为0

    // 获取评论列表
    async function fetchComments() {
      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'comments'
          },
          body: JSON.stringify({
            goods_id: route.params.orderId,
            user_id: route.query.current_user_id
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
            deliver_picture: comment.picture ? 
              URL.createObjectURL(base64ToBlob(comment.picture)) : 
              defaultAvatar
          };

          // 处理二级评论头像并添加 level
          if (comment.reply && Array.isArray(comment.reply)) {
            processedComment.reply = comment.reply.map(reply => ({
              ...reply,
              level: 2,  // 添加二级评论标识
              deliver_picture: reply.picture ? 
                URL.createObjectURL(base64ToBlob(reply.picture)) : 
                defaultAvatar
            }));
          }

          return processedComment;
        });

        comments.value = processedComments;
        console.log("评论列表：", comments.value);
        
      } catch (error) {
        console.error('Error fetching comments:', error);
        ElMessage.error('获取评论失败');
      }
    }

    // 提交评论
    async function submitComment() {
      if (!newComment.value.trim()) {
        ElMessage.warning('评论内容不能为空');
        return;
      }
      
      if (!commentRating.value) {
        ElMessage.warning('请给出评分');
        return;
      }
      
      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'commit_comment'
          },
          body: JSON.stringify({
            goods_id: route.params.orderId,
            comment: newComment.value,
            deliver_id: route.query.current_user_id,
            order_grade: commentRating.value
          })
        });
        
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('评论发表成功！');
          await fetchComments(); // 重新获取评论列表
          newComment.value = ''; // 清空输入框
          commentRating.value = 0; // 重置评分
        } else {
          ElMessage.error('评论发表失败，请重试');
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        ElMessage.error('评论发表失败，请稍后重试');
      }
    }

    // 切换回复框显示状态
    function toggleReply(comment) {
      // 如果点击的是当前已经打开的回复框，则关闭它
      if (activeReplyId.value === comment.order_comment_id) {
        activeReplyId.value = null;
        replyContent.value = '';
      } else {
        // 否则打开新的回复框
        activeReplyId.value = comment.order_comment_id;
        replyContent.value = '';
      }
    }

    // 修改提交回复函数
    async function submitReply(commentId) {
      if (!replyContent.value.trim()) {
        ElMessage.warning('回复内容不能为空');
        return;
      }

      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'commit_reply'
          },
          body: JSON.stringify({
            order_comment_id: commentId,
            comment: replyContent.value,
            deliver_id: route.query.current_user_id
          })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data.success) {
          ElMessage.success('回复成功');
          replyContent.value = '';
          activeReplyId.value = null;
          await fetchComments();
        } else {
          ElMessage.error('回复失败，请重试');
        }
      } catch (error) {
        console.error('Error submitting reply:', error);
        ElMessage.error('回复失败，请稍后重试');
      }
    }

    // // 点赞评论
    // async function likeComment(comment) {
    //   try {
    //     const response = await fetch("/order_detail", {
    //       method: "POST",
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'type': 'like_comment'
    //       },
    //       body: JSON.stringify({
    //         goods_id: route.params.orderId,
    //         comment_id: comment.id,
    //         user_id: route.query.current_user_id
    //       })
    //     });

    //     if (!response.ok) throw new Error('点赞失败');

    //     const data = await response.json();
    //     if (data.success) {
    //       comment.liked = !comment.liked;
    //       comment.likes = data.likes;
    //       if (comment.disliked) {
    //         comment.disliked = false;
    //         comment.dislikes = data.dislikes;
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error liking comment:', error);
    //     ElMessage.error('点赞失败');
    //   }
    // }

    // // 踩评论
    // async function dislikeComment(comment) {
    //   try {
    //     const response = await fetch("/order_detail", {
    //       method: "POST",
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'type': 'dislike_comment'
    //       },
    //       body: JSON.stringify({
    //         goods_id: route.params.orderId,
    //         comment_id: comment.id,
    //         user_id: route.query.current_user_id
    //       })
    //     });

    //     if (!response.ok) throw new Error('踩失败');

    //     const data = await response.json();
    //     if (data.success) {
    //       comment.disliked = !comment.disliked;
    //       comment.dislikes = data.dislikes;
    //       if (comment.liked) {
    //         comment.liked = false;
    //         comment.likes = data.likes;
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error disliking comment:', error);
    //     ElMessage.error('操作失败');
    //   }
    // }

    // 格式化时间
    function formatTime(timestamp) {
      if (!timestamp) return '暂无时间信息';
      
      try {
        const date = new Date(timestamp);
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
        console.error('Error formatting time:', error);
        return '时间格式错误';
      }
    }

    // // 点赞回复
    // async function likeReply(comment, reply) {
    //   try {
    //     const response = await fetch("/order_detail", {
    //       method: "POST",
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'type': 'like_reply'
    //       },
    //       body: JSON.stringify({
    //         goods_id: route.params.orderId,
    //         comment_id: comment.id,
    //         reply_id: reply.id,
    //         user_id: route.query.current_user_id
    //       })
    //     });

    //     if (!response.ok) throw new Error('点赞失败');

    //     const data = await response.json();
    //     if (data.success) {
    //       reply.liked = !reply.liked;
    //       reply.likes = data.likes;
    //       if (reply.disliked) {
    //         reply.disliked = false;
    //         reply.dislikes = data.dislikes;
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error liking reply:', error);
    //     ElMessage.error('点赞失败');
    //   }
    // }

    // // 踩回复
    // async function dislikeReply(comment, reply) {
    //   try {
    //     const response = await fetch("/order_detail", {
    //       method: "POST",
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'type': 'dislike_reply'
    //       },
    //       body: JSON.stringify({
    //         goods_id: route.params.orderId,
    //         comment_id: comment.id,
    //         reply_id: reply.id,
    //         user_id: route.query.current_user_id
    //       })
    //     });

    //     if (!response.ok) throw new Error('踩失败');

    //     const data = await response.json();
    //     if (data.success) {
    //       reply.disliked = !reply.disliked;
    //       reply.dislikes = data.dislikes;
    //       if (reply.liked) {
    //         reply.liked = false;
    //         reply.likes = data.likes;
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error disliking reply:', error);
    //     ElMessage.error('操作失败');
    //   }
    // }

    // 添加评论相关的辅助函数
    function isSecondLevelComment(comment) {
      return comment.level === 2;
    }

    function getCommentId(comment) {
      return comment.level === 2 ? 
        `reply_${comment.secondary_order_comment_id}` : 
        `comment_${comment.order_comment_id}`;
    }

    function getCommentAction(comment) {
      const commentId = getCommentId(comment);
      return commentActions.value.get(commentId) || null;
    }

    // 修改点赞和点踩函数
    async function handleLike(comment) {
      const commentId = getCommentId(comment);
      const level = isSecondLevelComment(comment) ? 2 : 1;
      const rawId = isSecondLevelComment(comment) ? 
        comment.secondary_order_comment_id : 
        comment.order_comment_id;
      const currentAction = commentActions.value.get(commentId);

      if (currentAction === 'like') {
        // 取消点赞逻辑
        try {
          const response = await fetch("/order_detail", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'type': 'like'
            },
            body: JSON.stringify({
              like: true,
              level: level,
              id: rawId,
              cancel: true
            })
          });

          if (!response.ok) throw new Error('Network response was not ok');

          const data = await response.json();
          if (data.success) {
            comment.helpful -= 1;
            commentActions.value.delete(commentId);
            ElMessage.success('已取消点赞');
          }
        } catch (error) {
          console.error('Error handling like:', error);
          ElMessage.error('操作失败，请稍后重试');
        }
        return;
      }

      if (currentAction === 'dislike') {
        ElMessage.warning('您已经点过踩了，如需点赞请先取消点踩');
        return;
      }

      // 正常点赞逻辑
      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'like'
          },
          body: JSON.stringify({
            like: true,
            level: level,
            id: rawId,
            cancel: false
          })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data.success) {
          comment.helpful += 1;
          commentActions.value.set(commentId, 'like');
          ElMessage.success('点赞成功');
        }
      } catch (error) {
        console.error('Error handling like:', error);
        ElMessage.error('操作失败，请稍后重试');
      }
    }

    async function handleDislike(comment) {
      const commentId = getCommentId(comment);
      const level = isSecondLevelComment(comment) ? 2 : 1;
      const rawId = isSecondLevelComment(comment) ? 
        comment.secondary_order_comment_id : 
        comment.order_comment_id;
      const currentAction = commentActions.value.get(commentId);

      if (currentAction === 'dislike') {
        // 取消点踩逻辑
        try {
          const response = await fetch("/order_detail", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'type': 'like'
            },
            body: JSON.stringify({
              like: false,
              level: level,
              id: rawId,
              cancel: true
            })
          });

          if (!response.ok) throw new Error('Network response was not ok');

          const data = await response.json();
          if (data.success) {
            comment.unhelpful -= 1;
            commentActions.value.delete(commentId);
            ElMessage.success('已取消点踩');
          }
        } catch (error) {
          console.error('Error handling dislike:', error);
          ElMessage.error('操作失败，请稍后重试');
        }
        return;
      }

      if (currentAction === 'like') {
        ElMessage.warning('您已经点过赞了，如需点踩请先取消点赞');
        return;
      }

      // 正常点踩逻辑
      try {
        const response = await fetch("/order_detail", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'type': 'like'
          },
          body: JSON.stringify({
            like: false,
            level: level,
            id: rawId,
            cancel: false
          })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data.success) {
          comment.unhelpful += 1;
          commentActions.value.set(commentId, 'dislike');
          ElMessage.success('点踩成功');
        }
      } catch (error) {
        console.error('Error handling dislike:', error);
        ElMessage.error('操作失败，请稍后重试');
      }
    }

    onMounted(() => {
      document.addEventListener('click', closeDropdown);
      fetchOrderDetail();
      fetchComments();
    });
    onUnmounted(() => {
      document.removeEventListener('click', closeDropdown);
    });


    return {
      goodsDetail,
      orderDetail,
      sellerPicture,
      canRequestRefund,
      confirmDelivery,
      requestRefund,
      getOrderStatusText,
      contactSeller,
      comments,
      newComment,
      submitComment,
      toggleReply,
      
      formatTime,
      
      base64ToBlob,
      toggleDropdown,
      closeDropdown,
      viewProfile,
      viewNotifications,
      viewMessages,
      contactUs,
      userAvatar,
      commentActions,
      activeReplyId,
      replyContent,
      getCommentAction,
      handleLike,
      handleDislike,
      submitReply,
      commentRating
    };
  }
};
</script>

<style scoped>


.header {
  background-color: #ff5000;
  padding: 10px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.nav-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  justify-content: space-between;
  height: 40px;
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

/* 主要内容区域样式 */
.order-details-view {
  padding-top: 60px;
  
  min-height: 100vh;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

/* 商品详情样式 */
.good-details {
    max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.good-info {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.good-images {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f5f5f5;
}

.good-details-info {
  flex: 1;
  padding: 20px;
}

.price {
  font-size: 24px;
  color: #ff5000;
  margin: 20px 0;
}

.deal-time {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.seller-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.good-description {
  background: white;
  padding: 20px;
  margin-bottom: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 评论区样式 */
.comments-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comment-input {
  margin: 20px 0;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.comment-input .el-button {
  margin-top: 15px;
  float: right;
}

.comments-list {
  margin-top: 30px;
}

.comment-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.comment-main {
  display: flex;
  gap: 15px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.comment-text {
  margin: 8px 0;
  color: #333;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 14px;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: #ff5000;
}

.action-btn.active {
  color: #ff5000;
}

.reply-btn {
  color: #1890ff;
}

.reply-btn:hover {
  color: #40a9ff;
}

.like-btn, .dislike-btn {
  display: flex;
  align-items: center;
}

.thumb-icon {
  font-size: 16px;
  margin-right: 4px;
}

.count {
  min-width: 20px;
  text-align: center;
}

.reply-list {
  margin-left: 55px;
  border-left: 2px solid #f0f0f0;
  padding-left: 15px;
}

.reply-item {
  margin-top: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.reply-item:last-child {
  border-bottom: none;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .good-info {
    flex-direction: column;
  }
  
  .good-images {
    max-width: 100%;
  }
  
  .reply-list {
    margin-left: 20px;
  }
  
  .comment-actions {
    gap: 10px;
  }
  
  .action-btn {
    padding: 2px 6px;
    font-size: 12px;
  }
}

/* 添加评分相关样式 */
.rating-section {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-label {
  font-size: 14px;
  color: #606266;
}

.comment-input {
  margin: 20px 0;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.comment-input .el-button {
  margin-top: 15px;
  float: right;
}

/* 修改评分组件样式 */
:deep(.el-rate) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-rate__text) {
  margin-left: 10px;
  font-size: 14px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.comment-rating {
  display: flex;
  align-items: center;
}

:deep(.el-rate) {
  display: inline-flex;
  align-items: center;
  height: 20px;
}

:deep(.el-rate__icon) {
  font-size: 16px;
  margin-right: 2px;
}

:deep(.el-rate__text) {
  font-size: 14px;
  color: #ff9900;
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
</style> 