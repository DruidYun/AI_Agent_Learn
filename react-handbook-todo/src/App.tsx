import { useState, useEffect, useMemo } from 'react'
import './App.css'

// Todo项类型定义
interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
  tag?: 'guitar' | 'art' | 'design' | null
}

// 标签映射
const tagMap = {
  guitar: { emoji: '🎸', label: '弹吉他', color: '#FF6B6B' },
  art: { emoji: '🎨', label: '画画', color: '#4ECDC4' },
  design: { emoji: '✏️', label: 'PS设计', color: '#45B7D1' },
}

// 筛选类型
type FilterType = 'all' | 'active' | 'completed'

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // 从localStorage加载数据
    const savedTodos = localStorage.getItem('handbook-todos')
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos)
        return parsed.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }))
      } catch {
        return []
      }
    }
    return []
  })
  
  const [inputText, setInputText] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedTag, setSelectedTag] = useState<keyof typeof tagMap | null>(null)

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('handbook-todos', JSON.stringify(todos))
  }, [todos])

  // 添加新待办
  const addTodo = () => {
    if (!inputText.trim()) return
    
    const newTodo: Todo = {
      id: Date.now(),
      text: inputText.trim(),
      completed: false,
      createdAt: new Date(),
      tag: selectedTag,
    }
    
    setTodos(prev => [newTodo, ...prev])
    setInputText('')
    setSelectedTag(null)
  }

  // 删除待办
  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  // 切换完成状态
  const toggleComplete = (id: number) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  // 开始编辑
  const startEdit = (todo: Todo) => {
    setEditId(todo.id)
    setEditText(todo.text)
  }

  // 保存编辑
  const saveEdit = (id: number) => {
    if (!editText.trim()) return
    
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      )
    )
    setEditId(null)
    setEditText('')
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditId(null)
    setEditText('')
  }

  // 筛选后的待办列表
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed)
      case 'completed':
        return todos.filter(todo => todo.completed)
      default:
        return todos
    }
  }, [todos, filter])

  // 数据统计
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter(todo => todo.completed).length
    const active = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, active, completionRate }
  }, [todos])

  // 处理回车键添加
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  // 处理编辑回车键保存
  const handleEditKeyPress = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') {
      saveEdit(id)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  return (
    <div className="handbook-app">
      {/* 装饰性背景元素 */}
      <div className="decorations">
        <div className="deco deco-1">🌸</div>
        <div className="deco deco-2">🎀</div>
        <div className="deco deco-3">💕</div>
        <div className="deco deco-4">🎸</div>
        <div className="deco deco-5">🎨</div>
        <div className="deco deco-6">✨</div>
      </div>

      {/* 主容器 */}
      <div className="main-container">
        {/* 标题区域 */}
        <header className="header">
          <div className="title-wrapper">
            <h1 className="title">
              <span className="title-emoji">📓</span>
              我的手帐待办清单
            </h1>
            <p className="subtitle">记录生活，让每一天都闪闪发光 ✨</p>
          </div>
          
          {/* 数据统计卡片 */}
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">全部</span>
            </div>
            <div className="stat-item">
              <span className="stat-number active">{stats.active}</span>
              <span className="stat-label">待完成</span>
            </div>
            <div className="stat-item">
              <span className="stat-number completed">{stats.completed}</span>
              <span className="stat-label">已完成</span>
            </div>
            <div className="stat-item">
              <span className="stat-number rate">{stats.completionRate}%</span>
              <span className="stat-label">完成率</span>
            </div>
          </div>
        </header>

        {/* 添加区域 */}
        <div className="add-section">
          <div className="input-wrapper">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="写下今天要做的事情吧~ 💭"
              className="todo-input"
            />
            <button onClick={addTodo} className="add-btn">
              <span className="btn-icon">📝</span>
              添加
            </button>
          </div>
          
          {/* 标签选择器 */}
          <div className="tag-selector">
            <span className="tag-label">添加标签：</span>
            <div className="tag-buttons">
              {Object.entries(tagMap).map(([key, value]) => (
                <button
                  key={key}
                  className={`tag-btn ${selectedTag === key ? 'selected' : ''}`}
                  onClick={() => setSelectedTag(
                    selectedTag === key ? null : key as keyof typeof tagMap
                  )}
                  style={{ borderColor: value.color }}
                >
                  {value.emoji} {value.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="filter-section">
          <div className="filter-buttons">
            {[
              { key: 'all', label: '📋 全部', count: stats.total },
              { key: 'active', label: '🎯 待完成', count: stats.active },
              { key: 'completed', label: '✅ 已完成', count: stats.completed },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                className={`filter-btn ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key as FilterType)}
              >
                {label}
                <span className="filter-count">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 待办列表 */}
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌸</div>
              <p className="empty-text">
                {filter === 'all' 
                  ? '还没有待办事项哦~ 快来添加第一条吧！'
                  : filter === 'active'
                  ? '所有任务都完成啦！🎉'
                  : '还没有完成任何任务哦~'}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo, index) => (
              <div
                key={todo.id}
                className={`todo-card ${todo.completed ? 'completed' : ''} ${
                  editId === todo.id ? 'editing' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* 完成复选框 */}
                <button
                  className={`checkbox ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggleComplete(todo.id)}
                >
                  {todo.completed ? '✅' : '⭕'}
                </button>

                {/* 内容区域 */}
                <div className="todo-content">
                  {editId === todo.id ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, todo.id)}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="save-btn"
                        >
                          💾
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="cancel-btn"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="todo-text-wrapper">
                        <span className={`todo-text ${todo.completed ? 'strikethrough' : ''}`}>
                          {todo.text}
                        </span>
                        {todo.tag && tagMap[todo.tag] && (
                          <span
                            className="todo-tag"
                            style={{ backgroundColor: tagMap[todo.tag].color + '20', color: tagMap[todo.tag].color }}
                          >
                            {tagMap[todo.tag].emoji} {tagMap[todo.tag].label}
                          </span>
                        )}
                      </div>
                      <div className="todo-meta">
                        <span className="todo-date">
                          📅 {todo.createdAt.toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* 操作按钮 */}
                {editId !== todo.id && (
                  <div className="todo-actions">
                    <button
                      onClick={() => startEdit(todo)}
                      className="action-btn edit-btn"
                      title="编辑"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="action-btn delete-btn"
                      title="删除"
                    >
                      🗑️
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 底部装饰 */}
        <footer className="footer">
          <div className="footer-content">
            <span className="footer-emoji">🎸🎨✏️</span>
            <p className="footer-text">
              用心记录，用爱生活 | 少女心手帐待办清单
            </p>
            <div className="footer-hearts">💕💕💕</div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App