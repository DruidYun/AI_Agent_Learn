import { useState, useEffect, useCallback } from 'react';
import './App.css';

/* ===== 类型定义 ===== */
type TagType = 'guitar' | 'art' | 'default';
type FilterType = 'all' | 'active' | 'completed';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tag: TagType;
  createdAt: number;
}

const TAG_CONFIG: Record<TagType, { label: string; icon: string; emoji: string }> = {
  guitar: { label: '🎸 弹吉他', icon: '🎸', emoji: '🎶' },
  art: { label: '🎨 画画/设计', icon: '🎨', emoji: '✨' },
  default: { label: '📝 普通', icon: '📝', emoji: '💖' },
};

const FILTER_OPTIONS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '🌸' },
  { key: 'active', label: '未完成', icon: '📋' },
  { key: 'completed', label: '已完成', icon: '✅' },
];

/* ===== 工具函数 ===== */
const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const loadTodos = (): Todo[] => {
  try {
    const raw = localStorage.getItem('handbook-todos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveTodos = (todos: Todo[]): void => {
  localStorage.setItem('handbook-todos', JSON.stringify(todos));
};

/* ===== App 组件 ===== */
function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagType>('default');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // 持久化
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // 筛选后的列表
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // 统计数据
  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  // 添加待办
  const handleAdd = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newTodo: Todo = {
      id: generateId(),
      text: trimmed,
      completed: false,
      tag: selectedTag,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInputText('');
    setSelectedTag('default');
  }, [inputText, selectedTag]);

  // 切换完成状态
  const handleToggle = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  // 删除（带动画）
  const handleDelete = useCallback((id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setRemovingId(null);
    }, 320);
  }, []);

  // 开始编辑
  const handleStartEdit = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  }, []);

  // 保存编辑
  const handleSaveEdit = useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed && editingId) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text: trimmed } : t))
      );
    }
    setEditingId(null);
    setEditText('');
  }, [editText, editingId]);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  // 键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (editingId) {
          handleSaveEdit();
        } else {
          handleAdd();
        }
      }
      if (e.key === 'Escape' && editingId) {
        handleCancelEdit();
      }
    },
    [handleAdd, handleSaveEdit, handleCancelEdit, editingId]
  );

  return (
    <div className="app-container">
      {/* ===== 头部卡片 ===== */}
      <header className="header-card">
        <div className="header-decorations">
          <span>🌸</span>
          <span>🎀</span>
          <span>💗</span>
          <span>🎀</span>
          <span>🌸</span>
        </div>
        <h1 className="header-title">✨ 少女心手帐 ✨</h1>
        <p className="header-subtitle">记录每一天的小确幸 💕</p>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-icon">📝</span>
            <span>全部</span>
            <span className="stat-count">{totalCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🌸</span>
            <span>待办</span>
            <span className="stat-count">{activeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span>完成</span>
            <span className="stat-count">{completedCount}</span>
          </div>
        </div>
      </header>

      {/* ===== 输入卡片 ===== */}
      <div className="input-card">
        <div className="todo-form">
          <input
            type="text"
            className="todo-input"
            placeholder="💭 今天想做什么呢？写下来吧..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
          />
          <button className="add-btn" onClick={handleAdd}>
            ✨ 添加
          </button>
        </div>
        <div className="tag-selector">
          {(Object.entries(TAG_CONFIG) as [TagType, typeof TAG_CONFIG['default']][]).map(
            ([key, config]) => (
              <button
                key={key}
                className={`tag-btn ${selectedTag === key ? 'active' : ''}`}
                onClick={() => setSelectedTag(key)}
              >
                {config.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* ===== 筛选栏 ===== */}
      <div className="filter-bar">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`filter-btn ${filter === opt.key ? 'active' : ''}`}
            onClick={() => setFilter(opt.key)}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* ===== 待办列表 ===== */}
      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {filter === 'completed' ? '🎉' : filter === 'active' ? '🌸' : '📒'}
            </div>
            <p className="empty-text">
              {filter === 'completed'
                ? '还没有完成的事项，加油哦～'
                : filter === 'active'
                  ? '太棒了！所有事项都完成啦 🎀'
                  : '手帐空空如也，快来写下第一个小心愿吧 💖'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const tagConfig = TAG_CONFIG[todo.tag];
            const isEditing = editingId === todo.id;
            const isRemoving = removingId === todo.id;

            return (
              <div
                key={todo.id}
                className={`todo-item tag-${todo.tag} ${todo.completed ? 'completed' : ''} ${isRemoving ? 'removing' : ''}`}
              >
                {/* 复选框 */}
                <div className="checkbox-wrapper">
                  <div
                    className={`checkbox-custom ${todo.completed ? 'checked' : ''}`}
                    onClick={() => handleToggle(todo.id)}
                  >
                    {todo.completed ? '✓' : ''}
                  </div>
                </div>

                {/* 内容区 */}
                <div className="todo-content">
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSaveEdit}
                      autoFocus
                      maxLength={100}
                    />
                  ) : (
                    <>
                      <div className="todo-text">{todo.text}</div>
                      <span className={`todo-tag ${todo.tag}`}>
                        {tagConfig.icon} {tagConfig.label}
                      </span>
                    </>
                  )}
                </div>

                {/* 操作按钮 */}
                {!isEditing && (
                  <div className="todo-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleStartEdit(todo)}
                      title="编辑"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(todo.id)}
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
