import { useEffect, useRef } from 'react'
import TodoItem from './TodoItem'

// 무한 스크롤: 리스트 하단 sentinel 이 보이면 loadMore 호출
export default function TodoList({
  items, loading, error, hasNext,
  onLoadMore, onToggle, onEdit, onDelete, busyId,
}) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMore])

  if (error) {
    return <p className="state state--error">{error}</p>
  }

  if (!loading && items.length === 0) {
    return <p className="state">할 일이 없습니다. 새 할 일을 추가해 보세요.</p>
  }

  return (
    <>
      <ul className="todo-list">
        {items.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            busy={busyId === todo.id}
          />
        ))}
      </ul>

      <div ref={sentinelRef} className="todo-list__sentinel">
        {loading && <span className="spinner" aria-label="불러오는 중" />}
        {!hasNext && items.length > 0 && <span className="state state--muted">마지막입니다</span>}
      </div>
    </>
  )
}
