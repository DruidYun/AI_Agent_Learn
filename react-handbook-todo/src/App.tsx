import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Todo {
  id: number
  text: string
  completed: boolean
  tag: 'guitar' | 'art' | 'design' | 'important' | 'none'
  createdAt: number
}

type FilterType = 'all' | 'active' | 'completed'

const TAG_CONFIG = {
  guitar: { emoji: '🎸', label: '弹吉他', color: '#ff9a9e' },
  art: { emoji: '🎨', label: '画画', color: '#a18cd1' },
  design: { emoji: '✨', label: 'PS设计', color: '#fbc2eb' },
  important: { emoji: '⭐', label: '重要事项', color: '#ffd700' },
  none: { emoji: '', label: '无标签', color: '#ddd' }
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('handbook-todos')
    return saved ? JSON.parse(saved) : []
  })
  const [inputValue, setInputValue] = useState('')
  const [selectedTag, setSelectedTag] = useState<Todo['tag']>('none')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set())
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('handbook-todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const addTodo = () => {
    if (!inputValue.trim()) return
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      tag: selectedTag,
      createdAt: Date.now()
    }
    setTodos(prev => [newTodo, ...prev])
    setInputValue('')
    setSelectedTag('none')
    setAnimatingIds(prev => new Set(prev).add(newTodo.id))
    setTimeout(() => {
      setAnimatingIds(prev => {
        const next = new Set(prev)
        next.delete(newTodo.id)
        return next
      })
    }, 500)
  }

  const removeTodo = (id: number) => {
    setRemovingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      setTodos(prev => prev.filter(t => t.id !== id))
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 300)
  }

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditValue(todo.text)
  }

  const saveEdit = () => {
    if (editingId !== null && editValue.trim()) {
      setTodos(prev => prev.map(t => t.id === editingId ? { ...t, text: editValue.trim() } : t))
    }
    setEditingId(null)
    setEditValue('')
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }

  return (
    <div className="app-container">
      <div className="floating-hearts">
        <span className="heart">💕</span>
        <span className="heart">🌸</span>
        <span className="heart">✨</span>
        <span className="heart">🎀</span>
        <span className="heart">💖</span>
      </div>
      
      <div className="notebook">
        <div className="spine"></div>
        <div className="page">
          <header className="header">
            <h1 className="title">
              <span className="title-icon">📔</span>
              我的手帐待办
              <span className="title-icon">🌷</span>
            </h1>
            <p className="subtitle">✨ 记录每一个闪闪发光的小目标 ✨</p>
          </header>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-emoji">📝</span>
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">全部</span>
            </div>
            <div className="stat-item active-stat">
              <span className="stat-emoji">💪</span>
              <span className="stat-num">{stats.active}</span>
              <span className="stat-label">进行中</span>
            </div>
            <div className="stat-item completed-stat">
              <span className="stat-emoji">🎉</span>
              <span className="stat-num">{stats.completed}</span>
              <span className="stat-label">已完成</span>
            </div>
          </div>

          <div className="input-section">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder="✏️ 写下今天的小目标..."
                className="todo-input"
              />
              <button onClick={addTodo} className="add-btn">
                <span>添加</span>
                <span className="btn-icon">🌟</span>
              </button>
            </div>
            
            <div className="tag-selector">
              <span className="tag-label">🏷️ 专属标签：</span>
              {Object.entries(TAG_CONFIG).filter(([key]) => key !== 'none').map(([key, config]) => (
                <button
                  key={key}
                  className={`tag-btn ${selectedTag === key ? 'selected' : ''}`}
                  style={{ '--tag-color': config.color } as React.CSSProperties}
                  onClick={() => setSelectedTag(key as Todo['tag'])}
                >
                  {config.emoji} {config.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-bar">
            {(['all', 'active', 'completed'] as FilterType[]).map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' && '📋 全部'}
                {f === 'active' && '🔥 未完成'}
                {f === 'completed' && '✅ 已完成'}
              </button>
            ))}
          </div>

          <div className="todo-list">
            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                <span className="empty-emoji">🌈</span>
                <p>还没有待办事项哦~</p>
                <p className="empty-hint">添加一个开始你的手帐之旅吧！</p>
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`todo-item ${todo.completed ? 'completed' : ''} ${animatingIds.has(todo.id) ? 'slide-in' : ''} ${removingIds.has(todo.id) ? 'slide-out' : ''}`}
                >
                  <button
                    className={`checkbox ${todo.completed ? 'checked' : ''}`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.completed && '✓'}
                  </button>
                  
                  <div className="todo-content">
                    {editingId === todo.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
                        }}
                        onBlur={saveEdit}
                        className="edit-input"
                      />
                    ) : (
                      <span
                        className="todo-text"
                        onDoubleClick={() => startEdit(todo)}
                      >
                        {todo.text}
                      </span>
                    )}
                    {todo.tag !== 'none' && (
                      <span
                        className="todo-tag"
                        style={{ backgroundColor: TAG_CONFIG[todo.tag].color + '33' }}
                      >
                        {TAG_CONFIG[todo.tag].emoji} {TAG_CONFIG[todo.tag].label}
                      </span>
                    )}
                  </div>

                  <div className="todo-actions">
                    <button className="action-btn edit" onClick={() => startEdit(todo)}>
                      ✏️
                    </button>
                    <button className="action-btn delete" onClick={() => removeTodo(todo.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <footer className="footer">
            <p>🎸 弹吉他 · 🎨 画画 · ✨ PS设计 · ⭐ 重要事项</p>
            <p className="footer-hint">双击文字可编辑 · 点击圆圈标记完成</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App
