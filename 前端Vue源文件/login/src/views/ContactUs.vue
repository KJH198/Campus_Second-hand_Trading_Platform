<template>
  <div class="contact-us">
    <header class="header">
      <div class="nav-container">
        <div class="welcome-text">联系我们</div>
      </div>
    </header>

    <main class="main-content">
      <el-card class="contact-card">
        <h2>联系方式</h2>
        <div class="contact-info">
          <div class="info-item">
            <el-icon><Message /></el-icon>
            <span>邮箱：support@example.com</span>
          </div>
          <div class="info-item">
            <el-icon><Phone /></el-icon>
            <span>电话：123-456-7890</span>
          </div>
          <div class="info-item">
            <el-icon><Location /></el-icon>
            <span>地址：北京市海淀区学院路37号‌</span>
          </div>
        </div>

        <div class="feedback-section">
          <h3>意见反馈</h3>
          <el-form :model="feedbackForm" ref="feedbackFormRef">
            <el-form-item>
              <el-input
                v-model="feedbackForm.content"
                type="textarea"
                rows="4"
                placeholder="请输入您的宝贵意见或建议..."
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitFeedback">
                提交反馈
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Message, Phone, Location } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'ContactUs',
  components: {
    Message,
    Phone,
    Location
  },
  setup() {
    const feedbackForm = ref({
      content: ''
    });
    const feedbackFormRef = ref(null);

    const submitFeedback = async () => {
      if (!feedbackForm.value.content.trim()) {
        ElMessage.warning('请输入反馈内容');
        return;
      }

      try {
        // 这里可以添加提交反馈的接口请求
        ElMessage.success('反馈提交成功！');
        feedbackForm.value.content = '';
      } catch (error) {
        console.error('提交反馈失败:', error);
        ElMessage.error('提交失败，请重试');
      }
    };

    return {
      feedbackForm,
      feedbackFormRef,
      submitFeedback
    };
  }
};
</script>

<style scoped>
.contact-us {
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
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-text {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.main-content {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.contact-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.contact-card h2 {
  margin: 0 0 20px;
  color: #333;
  font-size: 24px;
}

.contact-info {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 16px;
  color: #666;
}

.info-item .el-icon {
  font-size: 20px;
  color: #ff5000;
}

.feedback-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.feedback-section h3 {
  margin: 0 0 20px;
  color: #333;
  font-size: 18px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  width: 100%;
}
</style> 