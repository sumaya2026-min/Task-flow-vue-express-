<template>
  <section class="auth-page">
    <div class="auth-hero">
      <p class="eyebrow">Flowza</p>
      <h1>Build projects, track tasks, and stay focused.</h1>
    
    </div>

    <div class="auth-card">
      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Login</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">Register</button>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <input v-if="mode === 'register'" v-model="form.name" type="text" placeholder="Full name" required />
        <input v-model="form.email" type="email" placeholder="Email address" required />
        <input v-model="form.password" type="password" placeholder="Password" required minlength="6" />

        <p v-if="authStore.error" class="error-text">{{ authStore.error }}</p>

        <button class="primary-btn" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const mode = ref('login');
const form = reactive({ name: '', email: '', password: '' });

const submit = async () => {
  try {
    if (mode.value === 'login') {
      await authStore.login({ email: form.email, password: form.password });
    } else {
      await authStore.register({ name: form.name, email: form.email, password: form.password });
    }
    router.push('/dashboard');
  } catch (error) {
    console.log(error);
  }
};
</script>
