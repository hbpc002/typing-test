<script setup lang="ts">
import { reactive, inject } from 'vue';
import { useRouter } from 'vue-router';
import { adminLogin } from '@/request';

const router = useRouter();
const message: any = inject('message');

const state = reactive({
  password: '',
  loading: false,
});

async function handleLogin() {
  if (!state.password) return;
  state.loading = true;
  try {
    const res = await adminLogin({ password: state.password });
    const token = res.data?.result?.token;
    if (token) {
      localStorage.setItem('admin_token', token);
      message({ message: '登录成功' });
      router.push('/admin/articles');
    }
  } catch (e: any) {
    const msg = e.response?.data?.message || '密码错误';
    message({ message: msg, type: 'error' });
  } finally {
    state.loading = false;
  }
}
</script>

<template>
  <main class="y-main" style="max-width: 400px">
    <h2 style="margin-bottom: 24px; text-align: center">管理员登录</h2>
    <div class="y-admin-login">
      <input
        v-model="state.password"
        type="password"
        class="y-admin-login__input"
        placeholder="请输入管理员密码"
        @keyup.enter="handleLogin"
      />
      <button class="y-admin-login__btn" :disabled="state.loading" @click="handleLogin">
        {{ state.loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </main>
</template>

<style scoped lang="scss">
.y-admin-login {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.y-admin-login__input {
  padding: 12px 16px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  font-size: 16px;
  background: transparent;
  color: $gray-08;
  outline: none;
  &:focus {
    border-color: $main-color;
  }
}
.y-admin-login__btn {
  padding: 12px;
  border: none;
  border-radius: 4px;
  background: $main-color;
  color: $label-white;
  font-size: 16px;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
  }
}
</style>
