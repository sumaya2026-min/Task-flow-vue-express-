<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div>
        <div class="brand">
          <div class="brand-badge">T</div>
          <div>
            <h2>TaskFlow</h2>
            <p>Plan your work beautifully</p>
          </div>
        </div>

        <div class="user-card">
          <span>{{ authStore.user?.name }}</span>
          <small>{{ authStore.user?.email }}</small>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-head">
            <h3>Boards</h3>
            <button class="ghost-btn" @click="$emit('create-board')">+ New</button>
          </div>
          <button
            v-for="board in boards"
            :key="board._id"
            class="board-link"
            :class="{ active: selectedBoardId === board._id }"
            @click="$emit('select-board', board._id)"
          >
            {{ board.name }}
          </button>
        </div>
      </div>

      <button class="logout-btn" @click="logout">Logout</button>
    </aside>

    <main class="content-area">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  boards: Array,
  selectedBoardId: String
});

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/auth');
};
</script>
