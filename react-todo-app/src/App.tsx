import { useState, useEffect, useCallback } from 'react';
import './App.css';

// ==================== 类型定义 ====================
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tag: '🎸弹吉他' | '🎨画画学PS' | '🎀设计' | null;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

// ==================== 工具函数 ====================
const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const loadTodos = (): Todo[] => {
  try {
    const raw = localStorage.getItem('handbook-todos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveTodos = (todos: Todo[]) => {
  localStorage.setItem('handbook-todos', JSON.stringify(todos));
};

// ==================== 组件 ====================
function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedTag, setSelectedTag] = useState<Todo['tag']>(null);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  // 持久化
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // 筛选
  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  // 添加
  const addTodo = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: generateId(),
      text,
      completed: false,
      tag: selectedTag,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInputText('');
    setSelectedTag(null);
  }, [inputText, selectedTag]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  // 删除（带离场动画）
  const deleteTodo = useCallback((id: string) => {
    setAnimatingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 350);
  }, []);

  // 切换完成
  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  // 编辑
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const text = editText.trim();
    if (text) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text } : t))
      );
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  // 清空已完成
  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  return (
    <div className="app-wrapper">
      {/* 装饰浮动元素 */}
      <div className="floating-decor">
        <span className="decor deco-guitar">🎸</span>
        <span className="decor deco-palette">🎨</span>
        <span className="decor deco-heart">💖</span>
        <span className="decor deco-star">✨</span>
        <span className="decor deco-pencil">✏️</span>
        <span className="decor deco-sparkle">🌟</span>
      </div>

      <div className="handbook-card">
        {/* 头部 */}
        <header className="card-header">
          <div className="header-icon-row">
            <span>🎀</span>
            <span>📒</span>
            <span>🌸</span>
          </div>
          <h1 className="title">
            <span className="title-icon">💗</span>
            我的可爱手帐
            <span className="title-icon">💗</span>
          </h1>
          <p className="subtitle">✿ 把每一天的小确幸都记下来吧 ✿</p>
        </header>

        {/* 统计栏 */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-icon">📋</span>
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">全部</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-icon">✍️</span>
            <span className="stat-num">{stats.active}</span>
            <span className="stat-label">待完成</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-num">{stats.completed}</span>
            <span className="stat-label">已完成</span>
          </div>
        </div>

        {/* 输入区 */}
        <div className="input-area">
          <div className="input-row">
            <input
              type="text"
              className="todo-input"
              placeholder="今天想做什么呢？写下来吧～ ✨"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn-add" onClick={addTodo}>
              <span className="btn-add-icon">➕</span>
              <span>添加</span>
            </button>
          </div>
          {/* 标签选择 */}
          <div className="tag-selector">
            <span className="tag-label">🏷️ 标记：</span>
            {([
              { value: null, label: '📝 无标签' },
              { value: '🎸弹吉他' as const, label: '🎸 弹吉他' },
              { value: '🎨画画学PS' as const, label: '🎨 画画学PS' },
              { value: '🎀设计' as const, label: '🎀 设计' },
            ]).map((opt) => (
              <button
                key={String(opt.value)}
                className={`tag-chip ${selectedTag === opt.value ? 'active' : ''}`}
                onClick={() =>
                  setSelectedTag(selectedTag === opt.value ? null : opt.value)
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="filter-bar">
          {([
            { key: 'all', label: '🌸 全部' },
            { key: 'active', label: '🎀 未完成' },
            { key: 'completed', label: '✨ 已完成' },
          ] as const).map((f) => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          {stats.completed > 0 && (
            <button className="btn-clear" onClick={clearCompleted}>
              🧹 清空已完成
            </button>
          )}
        </div>

        {/* 列表 */}
        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              <span className="empty-icon">📭</span>
              <p>
                {filter === 'all'
                  ? '还没有待办事项哦～快来写第一条吧！💕'
                  : filter === 'active'
                    ? '太棒了！所有事项都完成啦～🎉'
                    : '还没有完成的事项呢，加油哦～💪'}
              </p>
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${animatingIds.has(todo.id) ? 'removing' : ''}`}
              >
                {/* 复选框 */}
                <button
                  className={`check-circle ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.completed ? '取消完成' : '标记完成'}
                >
                  {todo.completed ? '✅' : '○'}
                </button>

                {/* 内容 */}
                {editingId === todo.id ? (
                  <div className="edit-inline">
                    <input
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                    />
                    <button className="btn-save-edit" onClick={saveEdit}>
                      💾
                    </button>
                    <button className="btn-cancel-edit" onClick={cancelEdit}>
                      ❌
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="todo-text" onDoubleClick={() => startEdit(todo)}>
                      {todo.text}
                    </span>
                    {todo.tag && (
                      <span className={`todo-tag tag-${todo.tag.includes('吉他') ? 'guitar' : todo.tag.includes('画画') ? 'art' : 'design'}`}>
                        {todo.tag}
                      </span>
                    )}
                  </>
                )}

                {/* 操作按钮 */}
                {editingId !== todo.id && (
                  <div className="todo-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => startEdit(todo)}
                      title="编辑"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => deleteTodo(todo.id)}
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>

        {/* 底部 */}
        <footer className="card-footer">
          <p>
            💖 每一天都值得被温柔记录 💖
            <span className="footer-decor">🎸 🎨 ✨</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;