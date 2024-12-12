<template>
  <div class="login-container">
    <div class="slider">
      <!--登录表单-->
      <div :class="active === 1 ? 'form' : 'form hidden'">
        <div class="title">欢迎<b>回来</b></div>
        <div class="subtitle">登录你的账户</div>
        <div class="inputf">
          <input 
            type="text" 
            :placeholder="isManager ? '管理员账户' : '电话号码'" 
            name="phoneNumber"
            :class="{ 'error': inputErrors.phoneNumber }"
          />
          <span class="label">{{ isManager ? '管理员账号' : '电话号码' }}</span>
        </div>
        <div class="inputf">
          <input 
            type="text" 
            placeholder="密码" 
            name="password"
            :class="{ 'error': inputErrors.password }"
          />
          <span class="label">密码</span>
        </div>
        <div class="user-type">
          <label>
            <input 
              type="checkbox" 
              @change="handleUserTypeChange"
            /> 管理员登录
          </label>
        </div>
        <button type="submit" id="signinbutton">登录</button>
      </div>
      <!--注册表单-->
      <div :class="active === 2 ? 'form' : 'form hidden'">
        <div class="title">欢迎<b>使用</b></div>
        <div class="subtitle">创建你的账户</div>
        <div class="inputf">
          <input type="text" placeholder="用户名" name = "username"/>
          <span class="label">用户名</span>
        </div>
        <div class="inputf">
          <input type="text" placeholder="密码" name="loginpassword"/>
          <span class="label">密码</span>
        </div>
        <div class="inputf">
          <input type="text" placeholder="电话" name="phone"/>
          <span class="label">电话</span>
        </div>
        <button type="submit" id="signupbutton">注册</button>
      </div>
      <!--网站名片-->
      <div :class="active === 1 ?'card' : 'card active'">
        <div class="head">
          <div class="name"><span></span></div>
          <div class="desc">高效便捷的校园二手交易平台，让闲置物品焕发新生，轻松买卖，快乐分享！</div>
          <div class="btn">
            新用户 ?
            <button @click="togglecard">{{ cardbutton }}</button>
          </div>
        </div>
      </div></div>
  </div>
</template>
<script>
import {onMounted, ref} from "vue";
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  name: "Login",
  setup() {
    let active = ref(1);
    let cardbutton = "去注册";
    const router = useRouter();
    const isManager = ref(false);
    const inputErrors = ref({
      phoneNumber: false,
      password: false
    });

    function togglecard  ()  {
        this.active = (this.active === 1) ? 2 : 1;
      this.cardbutton = (this.cardbutton === "去注册") ? "去登录":"去注册";
    }
    function handleUserTypeChange(event) {
      isManager.value = event.target.checked;
    }
    async function handleLogin() {
      try {
        const inputValue = document.querySelector('input[name="phoneNumber"]').value;
        const password = document.querySelector('input[name="password"]').value;

        // 验证输入
        inputErrors.value.phoneNumber = !inputValue;
        inputErrors.value.password = !password;

        // 如果有空值，不继续提交
        if (!inputValue || !password) {
          return;
        }

        // 构造请求体
        const requestBody = {
          password: password,
          isManager: isManager.value
        };

        // 根据是否是管理员添加不同的字段
        if (isManager.value) {
          requestBody.manager_name = inputValue;
        } else {
          requestBody.phone_number = inputValue;
        }

        const response = await fetch('/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'type': 'login'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.success) {
          ElMessage.success('登录成功！');
          
          if (isManager.value) {
            // 管理员登录，只传入管理员名字
            router.push({
              path: '/manager',
              query: {
                admin_name: inputValue
              }
            });
          } else {
            // 普通用户登录，传入用户ID
            router.push({
              path: '/home',
              query: {
                user_id: data.user_id
              }
            });
          }
        } else {
          // 处理登录失败的不同情况
          if (data.info === 'banned') {
            ElMessage.error('该账号已被封禁！');
          } else if (data.info === 'wrong') {
            ElMessage.error(isManager.value ? '管理员账号或密码不正确' : '手机号或密码不正确');
          } else {
            ElMessage.error('登录失败，请重试');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        ElMessage.error('登录失败，请稍后重试');
      }
    }
    const handleregister = async ()=>  {
      const user_name = document.querySelector('input[name="username"]').value;
      const password = document.querySelector('input[name="loginpassword"]').value;
      const phone_number = document.querySelector('input[name="phone"]').value;
      console.log(password);
      try {
        const response = await fetch("/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'type': 'register'
          },
          body: JSON.stringify({user_name, password, phone_number}),
        });

        const data = await response.json();
        const success = data.success;
        // console.log(success)
        if (success) {
          alert("注册成功")
        } else {
          // console.error('sign up failed:', data.message);
          alert("注册失败")
        }
      } catch (error) {
        console.error('Error during log:', error);
        alert("发生了意想不到的错误")
      }
    }
    onMounted(() => {
      const signinButton = document.getElementById("signinbutton");
      const signupButton = document.getElementById("signupbutton")
      if(signupButton){
        signupButton.addEventListener('click',(event) => {
          event.preventDefault();
          handleregister();
        })
      }
      if (signinButton) {
        signinButton.addEventListener('click', (event) => {
          event.preventDefault();
          handleLogin();
        });
      }
    });

    return{
      active,
      cardbutton,
      handleLogin,
      handleregister,
      togglecard,
      handleUserTypeChange,
      isManager,
      inputErrors,
    };
  },
};
</script>
<style lang="scss">
.login-container{
  width:100%;
  min-height:100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("../assets/new_back.png") no-repeat center;
  background-size: cover;
  .slider{
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    .form{
      margin:0 10px;
      width: 400px;
      height: 500px;
      background: rgba(17,25,40,0.75);
      backdrop-filter: blur(16px) saturate(0);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
      padding: 40px 60px;
      box-shadow:
          rgba(50,50,93,0.25) 50px 50px 100px -20px,
          rgba(0,0,0,0.5) 30px 30px 60px -30px,
          rgba(212,217,222,0.35) -2px -2px 6px 0px inset;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: flex-start;
      z-index: 3;
      transition:0.5s ease-in-out;
      &.hidden{
        height: 395px;
        box-shadow: none;
        z-index: 1;
      }
      .title{
        font-size: 24px;
        color:rgb(246,240,255);
        letter-spacing: 1px;
        font-weight: 300;
      }
      .subtitle{
        font-size: 11px;
        color:rgb(246,240,255);
        margin-bottom: 35px;
      }
      .inputf{
        width: 100%;
        position: relative;
        margin-bottom: 35px;
        input{
          width: 100%;
          height: 35px;
          border: none;
          outline: 1.5px solid rgb(200,200,220);
          background:transparent;
          border-radius: 8px;
          font-size: 12px;
          padding: 0 15px;
          color:rgb(246,240,255);
          transition: outline-color 0.3s;
          &.error {
            outline-color: #ff4444;
          }
          &::placeholder{
            color: rgb(175,180,190);
          }
          &:focus{
            outline: 1.5px solid rgb(246,255,255);
            &::placeholder{
              opacity: 0;
            }
            & + .label{
              opacity: 1;
              top: -20px;
            }
          }
          &:not(:placeholder-shown) + .label{
            opacity: 1;
            top: -20px;
          }
        }
        .label{
          position: absolute;
          top: 0;
          left: 0;
          color: rgb(246,249,255);
          font-size: 11px;
          font-weight: bold;
          transition: 0.25s ease-out;
          opacity: 0;
        }
      }
      button{
        width: 100%;
        height: 35px;
        background: rgb(36,217,127);
        color: #ffffff;
        border: none;
        outline: none;
        border-radius: 5px;
        font-weight: bold;
        font-size: 12px;
        cursor:pointer;
      }
    }
    .card{
      position: absolute;
      right: 0;
      top: 50%;
      transform:translate(0,-50%);
      width: 430px;
      height: 400px;
      background: url("../assets/logo.jpg") white no-repeat center top 20px;
      background-size: 50%;
      border-radius: 0 10px 10px 0;
      transition: 0.5s ease-in-out;
      padding: 40px;
      z-index: 2;
      &.active{
        right: calc(100% - 440px);
        border-radius:  10px 0 0 10px ;
      }
      .head{
        font-size: 34px;
        padding-top: 50px;
        .name{
          font-weight: 300;
          span{
            font-style: v-bind(300);
            color: rgb(36, 75, 217);
            font-weight: bold;
          }
        }
      }
      .desc{
        margin-top: 150px;
        font-size: 20px;
        font-style: italic;
        text-align: justify;
        margin-bottom: 35px;
      }
      .btn{
        font-size: 20px;
        font-weight: bold;
        button{
          color: rgb(36,217,127);
          font-size: 14px;
          padding: 5px 15px;
          border: none;
          outline: none;
          border-radius: 5px;
          cursor:pointer;
          margin-left: 10px;
        }
      }
    }
  }
}
.user-type {
  display: flex;
  margin-bottom: 20px;
  color: rgb(246,240,255);
  font-size: 14px;

  label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }

  input[type="checkbox"] {
    cursor: pointer;
  }
}
</style>
