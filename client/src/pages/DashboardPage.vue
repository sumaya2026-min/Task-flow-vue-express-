<template>
  <AppLayout
    :boards="boardStore.boards"
    :selected-board-id="boardStore.selectedBoardId"
    @select-board="boardStore.selectedBoardId = $event"
    @create-board="handleCreateBoard"
  >
    <template v-if="boardStore.selectedBoard">
      <div class="topbar">
        <div>
          <p class="eyebrow">Workspace</p>
          <input class="board-title-input" :value="boardStore.selectedBoard.name" @change="renameBoard($event)" />
        </div>
        <button class="primary-btn" @click="addColumn">+ Add Column</button>
      </div>

      <div class="board-grid">
        <section
          v-for="column in boardStore.selectedBoard.columns"
          :key="column._id"
          class="column-card"
          :class="{ 'column-card--active-drop': activeDropColumnId === column._id }"
          @dragover.prevent="handleDragOver(column._id)"
          @dragleave="handleDragLeave(column._id)"
          @drop.prevent="handleDrop(column._id)"
        >
          <div class="column-head">
            <input :value="column.title" @change="renameColumn(column._id, $event)" />
            <button class="mini-btn danger" @click="removeColumn(column._id)">Delete</button>
          </div>

          <div class="tasks-list" :class="{ 'tasks-list--empty': !column.tasks.length }">
            <TaskCard
              v-for="task in column.tasks"
              :key="task._id"
              :task="task"
              @edit="openEditModal(column._id, task)"
              @delete="removeTask(column._id, task._id)"
              @dragstart="startTaskDrag(column._id, task._id)"
              @dragend="endTaskDrag"
            />
            <p v-if="!column.tasks.length" class="drop-hint">Drop a task here</p>
          </div>

          <button class="add-task-btn" @click="openCreateModal(column._id)">+ Add Task</button>
        </section>
      </div>
    </template>

    <TaskModal
      v-if="showModal"
      :task="editingTask"
      @close="closeModal"
      @save="saveTask"
    />
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AppLayout from '../layouts/AppLayout.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskModal from '../components/TaskModal.vue';
import { useBoardStore } from '../stores/board';

const boardStore = useBoardStore();
const showModal = ref(false);
const editingTask = ref(null);
const selectedColumnId = ref('');
const draggedTask = ref(null);
const activeDropColumnId = ref('');

onMounted(async () => {
  await boardStore.fetchBoards();
});

const handleCreateBoard = async () => {
  const name = window.prompt('Board name?', 'New Project Board');
  if (name) await boardStore.createBoard(name);
};

const renameBoard = async (event) => {
  await boardStore.renameBoard(boardStore.selectedBoard._id, event.target.value);
};

const addColumn = async () => {
  const title = window.prompt('Column title?', 'New Column');
  if (title) await boardStore.addColumn(boardStore.selectedBoard._id, title);
};

const renameColumn = async (columnId, event) => {
  await boardStore.renameColumn(boardStore.selectedBoard._id, columnId, event.target.value);
};

const removeColumn = async (columnId) => {
  if (confirm('Delete this column?')) {
    await boardStore.deleteColumn(boardStore.selectedBoard._id, columnId);
  }
};

const openCreateModal = (columnId) => {
  selectedColumnId.value = columnId;
  editingTask.value = null;
  showModal.value = true;
};

const openEditModal = (columnId, task) => {
  selectedColumnId.value = columnId;
  editingTask.value = task;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingTask.value = null;
};

const saveTask = async (taskData) => {
  if (editingTask.value) {
    await boardStore.updateTask(boardStore.selectedBoard._id, selectedColumnId.value, editingTask.value._id, taskData);
  } else {
    await boardStore.addTask(boardStore.selectedBoard._id, selectedColumnId.value, taskData);
  }
  closeModal();
};

const removeTask = async (columnId, taskId) => {
  if (confirm('Delete this task?')) {
    await boardStore.deleteTask(boardStore.selectedBoard._id, columnId, taskId);
  }
};

const startTaskDrag = (columnId, taskId) => {
  draggedTask.value = { columnId, taskId };
};

const endTaskDrag = () => {
  draggedTask.value = null;
  activeDropColumnId.value = '';
};

const handleDragOver = (columnId) => {
  activeDropColumnId.value = columnId;
};

const handleDragLeave = (columnId) => {
  if (activeDropColumnId.value === columnId) {
    activeDropColumnId.value = '';
  }
};

const handleDrop = async (destinationColumnId) => {
  if (!draggedTask.value) return;

  const { columnId, taskId } = draggedTask.value;
  if (columnId === destinationColumnId) {
    endTaskDrag();
    return;
  }

  await boardStore.moveTask(boardStore.selectedBoard._id, columnId, destinationColumnId, taskId);
  endTaskDrag();
};
</script>
