import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [],
    selectedBoardId: '',
    loading: false
  }),
  getters: {
    selectedBoard(state) {
      return state.boards.find((board) => board._id === state.selectedBoardId) || state.boards[0] || null;
    }
  },
  actions: {
    getConfig() {
      const authStore = useAuthStore();
      return {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      };
    },
    async fetchBoards() {
      this.loading = true;
      try {
        const { data } = await axios.get(`${API_URL}/boards`, this.getConfig());
        this.boards = data;
        if (!this.selectedBoardId && data.length) {
          this.selectedBoardId = data[0]._id;
        }
      } finally {
        this.loading = false;
      }
    },
    async createBoard(name) {
      const { data } = await axios.post(`${API_URL}/boards`, { name }, this.getConfig());
      this.boards.unshift(data);
      this.selectedBoardId = data._id;
    },
    async renameBoard(boardId, name) {
      const { data } = await axios.patch(`${API_URL}/boards/${boardId}`, { name }, this.getConfig());
      this.replaceBoard(data);
    },
    async addColumn(boardId, title) {
      const { data } = await axios.post(`${API_URL}/boards/${boardId}/columns`, { title }, this.getConfig());
      this.replaceBoard(data);
    },
    async renameColumn(boardId, columnId, title) {
      const { data } = await axios.patch(`${API_URL}/boards/${boardId}/columns/${columnId}`, { title }, this.getConfig());
      this.replaceBoard(data);
    },
    async deleteColumn(boardId, columnId) {
      const { data } = await axios.delete(`${API_URL}/boards/${boardId}/columns/${columnId}`, this.getConfig());
      this.replaceBoard(data);
    },
    async addTask(boardId, columnId, task) {
      const { data } = await axios.post(`${API_URL}/boards/${boardId}/columns/${columnId}/tasks`, task, this.getConfig());
      this.replaceBoard(data);
    },
    async updateTask(boardId, columnId, taskId, task) {
      const { data } = await axios.patch(`${API_URL}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, task, this.getConfig());
      this.replaceBoard(data);
    },
    async deleteTask(boardId, columnId, taskId) {
      const { data } = await axios.delete(`${API_URL}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, this.getConfig());
      this.replaceBoard(data);
    },
    async moveTask(boardId, sourceColumnId, destinationColumnId, taskId) {
      const { data } = await axios.post(
        `${API_URL}/boards/${boardId}/move-task`,
        { sourceColumnId, destinationColumnId, taskId },
        this.getConfig()
      );
      this.replaceBoard(data);
    },
    replaceBoard(updatedBoard) {
      this.boards = this.boards.map((board) => (board._id === updatedBoard._id ? updatedBoard : board));
    }
  }
});
