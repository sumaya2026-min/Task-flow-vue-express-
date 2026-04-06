import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('taskflow_user') || 'null'),
    token: localStorage.getItem('taskflow_token') || '',
    loading: false,
    error: ''
  }),
  actions: {
    async register(payload) {
      this.loading = true;
      this.error = '';
      try {
        const { data } = await axios.post(`${API_URL}/auth/register`, payload);
        this.setSession(data);
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async login(payload) {
      this.loading = true;
      this.error = '';
      try {
        const { data } = await axios.post(`${API_URL}/auth/login`, payload);
        this.setSession(data);
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    setSession(data) {
      this.user = data.user;
      this.token = data.token;
      localStorage.setItem('taskflow_user', JSON.stringify(data.user));
      localStorage.setItem('taskflow_token', data.token);
    },
    logout() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('taskflow_user');
      localStorage.removeItem('taskflow_token');
    }
  }
});
