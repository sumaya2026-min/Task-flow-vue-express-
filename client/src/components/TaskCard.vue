<template>
  <article
    class="task-card"
    draggable="true"
    @dragstart="emit('dragstart', task)"
    @dragend="emit('dragend')"
  >
    <div class="task-top">
      <span class="priority" :class="task.priority">{{ task.priority }}</span>
      <span class="drag-chip">Drag to move</span>
    </div>

    <h4>{{ task.title }}</h4>
    <p>{{ task.description || 'No description added yet.' }}</p>

    <div class="task-footer">
      <small>{{ task.dueDate ? `Due: ${task.dueDate}` : 'No due date' }}</small>
      <div class="task-actions">
        <button class="mini-btn" @click="$emit('edit')">Edit</button>
        <button class="mini-btn danger" @click="$emit('delete')">Delete</button>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  task: Object
});

const emit = defineEmits(['edit', 'delete', 'dragstart', 'dragend']);
</script>
