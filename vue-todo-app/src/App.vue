<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const todos = ref<Todo[]>([]);
const newTodoText = ref('');
const editingId = ref<string | null>(null);
const editedText = ref('');
const filter = ref<'all' | 'active' | 'completed'>('all');

// Load todos from localStorage on mount
onMounted(() => {
  const savedTodos = localStorage.getItem('todos');
  if (savedTodos) {
    try {
      const parsed = JSON.parse(savedTodos);
      todos.value = parsed.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }));
    } catch (e) {
      console.error('Failed to parse todos from localStorage', e);
    }
  }
});

// Save todos to localStorage whenever they change
const saveTodos = () => {
  localStorage.setItem('todos', JSON.stringify(todos.value));
};

// Add a new todo
const addTodo = () => {
  if (newTodoText.value.trim() === '') return;
  
  const newTodo: Todo = {
    id: Date.now().toString(),
    text: newTodoText.value.trim(),
    completed: false,
    createdAt: new Date()
  };
  
  todos.value.unshift(newTodo);
  newTodoText.value = '';
  saveTodos();
};

// Delete a todo
const deleteTodo = (id: string) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
  saveTodos();
};

// Toggle todo completion
const toggleTodo = (id: string) => {
  todos.value = todos.value.map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
};

// Start editing a todo
const startEditing = (todo: Todo) => {
  editingId.value = todo.id;
  editedText.value = todo.text;
};

// Save edited todo
const saveEdit = () => {
  if (!editingId.value || editedText.value.trim() === '') return;
  
  todos.value = todos.value.map(todo => 
    todo.id === editingId.value ? { ...todo, text: editedText.value.trim() } : todo
  );
  
  editingId.value = null;
  editedText.value = '';
  saveTodos();
};

// Cancel editing
const cancelEdit = () => {
  editingId.value = null;
  editedText.value = '';
};

// Filtered todos
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed);
    case 'completed':
      return todos.value.filter(todo => todo.completed);
    default:
      return todos.value;
  }
});

// Stats
const activeCount = computed(() => todos.value.filter(todo => !todo.completed).length);
const completedCount = computed(() => todos.value.filter(todo => todo.completed).length);
</script>

<template>
  <div class="todo-app">
    <header class="app-header">
      <h1>✨ Vue TodoList</h1>
      <p>功能丰富、美观且带动画的待办事项应用</p>
    </header>

    <main class="app-main">
      <!-- Add Todo Form -->
      <div class="add-form">
        <input
          v-model="newTodoText"
          @keyup.enter="addTodo"
          type="text"
          placeholder="添加新任务..."
          class="todo-input"
        />
        <button @click="addTodo" class="add-btn">➕ 添加</button>
      </div>

      <!-- Filter Controls -->
      <div class="filter-controls">
        <button 
          @click="filter = 'all'" 
          :class="{ active: filter === 'all' }"
          class="filter-btn"
        >
          全部 ({{ todos.length }})
        </button>
        <button 
          @click="filter = 'active'" 
          :class="{ active: filter === 'active' }"
          class="filter-btn"
        >
          进行中 ({{ activeCount }})
        </button>
        <button 
          @click="filter = 'completed'" 
          :class="{ active: filter === 'completed' }"
          class="filter-btn"
        >
          已完成 ({{ completedCount }})
        </button>
      </div>

      <!-- Todo List -->
      <div class="todo-list">
        <transition-group name="list" tag="ul">
          <li 
            v-for="todo in filteredTodos" 
            :key="todo.id" 
            class="todo-item"
            :class="{ completed: todo.completed }"
          >
            <div class="todo-content">
              <input 
                type="checkbox" 
                :checked="todo.completed" 
                @change="toggleTodo(todo.id)"
                class="todo-checkbox"
              />
              <div class="todo-text">
                <transition name="fade">
                  <span v-if="editingId !== todo.id" class="todo-display">
                    {{ todo.text }}
                  </span>
                  <input 
                    v-else 
                    v-model="editedText" 
                    @keyup.enter="saveEdit" 
                    @blur="saveEdit" 
                    type="text" 
                    class="todo-edit-input"
                    autofocus
                  />
                </transition>
              </div>
              <div class="todo-actions">
                <button 
                  v-if="editingId !== todo.id" 
                  @click="startEditing(todo)" 
                  class="edit-btn"
                >
                  ✏️ 编辑
                </button>
                <button 
                  v-else 
                  @click="saveEdit" 
                  class="save-btn"
                >
                  ✓ 保存
                </button>
                <button 
                  v-if="editingId !== todo.id" 
                  @click="deleteTodo(todo.id)" 
                  class="delete-btn"
                >
                  🗑️ 删除
                </button>
                <button 
                  v-else 
                  @click="cancelEdit" 
                  class="cancel-btn"
                >
                  ✖️ 取消
                </button>
              </div>
            </div>
          </li>
        </transition-group>

        <!-- Empty State -->
        <div v-if="filteredTodos.length === 0" class="empty-state">
          <p v-if="filter === 'all'">还没有任何待办事项！</p>
          <p v-else-if="filter === 'active'">所有任务都已完成！🎉</p>
          <p v-else>暂无已完成的任务。</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">总计</span>
          <span class="stat-value">{{ todos.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">进行中</span>
          <span class="stat-value">{{ activeCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value">{{ completedCount }}</span>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>Vue TodoList &copy; {{ new Date().getFullYear() }} | 数据已自动保存到本地存储</p>
    </footer>
  </div>
</template>

<style scoped>
.todo-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.add-form {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 0.5rem;
}

.todo-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.todo-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.filter-controls {
  padding: 1rem 1.5rem;
  background: #f0f4f8;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.filter-btn:hover:not(.active) {
  background: #e9ecef;
}

.todo-list {
  padding: 0;
  max-height: 500px;
  overflow-y: auto;
}

.todo-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  animation: fadeIn 0.4s ease-out;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: #f8f9fa;
}

.todo-item.completed .todo-display {
  text-decoration: line-through;
  color: #6c757d;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.todo-text {
  flex: 1;
  min-width: 0;
}

.todo-display {
  font-size: 1.1rem;
  color: #333;
  word-break: break-word;
  padding: 0.25rem 0;
}

.todo-edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #667eea;
  border-radius: 4px;
  font-size: 1.1rem;
  outline: none;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .save-btn, .delete-btn, .cancel-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #007bff;
  color: white;
}

.save-btn {
  background: #28a745;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.edit-btn:hover {
  background: #0056b3;
}

.save-btn:hover {
  background: #1e7e34;
}

.delete-btn:hover {
  background: #c82333;
}

.cancel-btn:hover {
  background: #5a6778;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.stats {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.app-footer {
  text-align: center;
  margin-top: 2rem;
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .todo-app {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .add-form {
    flex-direction: column;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
