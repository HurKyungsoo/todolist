import { useEffect, useRef } from 'react'
import TodoItem from './TodoItem'
import { InboxIcon, AlertIcon } from './icons'

function Skeleton() {
  return (
    <ul className="skeleton-list" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => <li key={i} className="sk" />)}
    </ul>
  )
}

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
      (entries) => { if (entries[0].isIntersecting) onLoadMore() },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMore])

  if (error) {
    return (
      <div className="state state--error">
        <span className="state__icon"><AlertIcon /></span>
        {error}
      </div>
    )
  }

  if (loading && items.length === 0) return <Skeleton />

  if (items.length === 0) {
    return (
      <div className="state">
        <span className="state__icon"><InboxIcon /></span>
        아직 할 일이 없어요. 오른쪽 위 <strong>+ 새 할 일</strong>로 추가해 보세요.
      </div>
    )
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
        {!hasNext && <span className="state state--muted">모두 불러왔습니다</span>}
      </div>
    </>
  )
}
