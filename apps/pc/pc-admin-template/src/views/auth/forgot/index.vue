<template>
  <div class="auth-placeholder">
    <h1>忘记密码</h1>
    <p>占位页，可按业务接入找回密码流程</p>
    <router-link to="/login">返回登录</router-link>
  </div>
</template>

<style lang="scss" scoped>
.auth-placeholder {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: $text-primary;
  a {
    color: $primary-color;
  }
}
</style>
