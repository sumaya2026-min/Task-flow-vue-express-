<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-head">
        <h3>{{ isEdit ? 'Edit Task' : 'Add Task' }}</h3>
        <button class="icon-btn" @click="$emit('close')">✕</button>
      </div>

      <form class="task-form" @submit.prevent="submitTask">
        <input v-model="form.title" type="text" placeholder="Task title" required />
        <textarea v-model="form.description" rows="4" placeholder="Task description"></textarea>
        <select v-model="form.priority">
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input v-model="form.dueDate" type="date" />
        <button class="primary-btn" type="submit">{{ isEdit ? 'Save Changes' : 'Create Task' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  task: { type: Object, default: null }
});

const emit = defineEmits(['save', 'close']);

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
});

const isEdit = computed(() => !!props.task);

watch(
  () => props.task,
  (task) => {
    form.title = task?.title || '';
    form.description = task?.description || '';
    form.priority = task?.priority || 'medium';
    form.dueDate = task?.dueDate || '';
  },
  { immediate: true }
);

const submitTask = () => emit('save', { ...form });
</script>
