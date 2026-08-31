import { useEffect, useMemo, useRef, useState } from 'react'
import TodoItem from './TodoItem'
import SortableList from './SortableList'
import { InboxIcon, AlertIcon, ChevronDownIcon } from './icons'
import { groupTodos } from '../utils/grouping'

function Skeleton() {
  return (
    <ul className="skeleton-list" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => <li key={i} className="sk" />)}
    </ul>
  )
}

// 무한 스크롤: 리스트 하단 sentinel 이 보이면 loadMore 호출.
// 로드된 항목은 기한 초과 / 오늘 / 예정 / 완료 그룹으로 묶어 보여준다.
export default function TodoList({
  items, loading, error, hasNext, statusFilter, manualSort,
  onLoadMore, onToggle, onEdit, onDelete, onReschedule, onSetPriority, onClearCompleted, onReorder,
  exitingId, busyId,
}) {
  const sentinelRef = useRef(null)
  const groups = useMemo(() => groupTodos(items), [items])

  // '완료' 필터를 직접 고른 게 아니면 완료 그룹은 접어 둔다. 필터가 바뀌면 렌더 중 동기화.
  const [doneOpen, setDoneOpen] = useState(statusFilter === 'true')
  const [clearConfirm, setClearConfirm] = useState(false)
  const [prevStatus, setPrevStatus] = useState(statusFilter)
  if (statusFilter !== prevStatus) {
    setPrevStatus(statusFilter)
    setDoneOpen(statusFilter === 'true')
    setClearConfirm(false)
  }

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
        {statusFilter === 'false' ? '남은 할 일이 없어요. 잘하고 있어요 🎉' : '조건에 맞는 할 일이 없어요.'}
      </div>
    )
  }

  if (manualSort) {
    return (
      <>
        <p className="list-hint">← 그립을 잡고 드래그해 순서를 바꿔요</p>
        <SortableList
          items={items}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onReschedule={onReschedule}
          onSetPriority={onSetPriority}
          onReorder={onReorder}
          exitingId={exitingId}
          busyId={busyId}
        />
        <div ref={sentinelRef} className="todo-list__sentinel">
          {loading && <span className="spinner" aria-label="불러오는 중" />}
          {!hasNext && <span className="state state--muted">모두 불러왔습니다</span>}
        </div>
      </>
    )
  }

  return (
    <>
      {groups.map((group) => {
        const isDone = group.key === 'done'
        const collapsed = isDone && !doneOpen
        return (
          <section className="group" key={group.key}>
            <div className="group__head">
              {isDone ? (
                <button
                  type="button"
                  className="group__toggle"
                  onClick={() => setDoneOpen((v) => !v)}
                  aria-expanded={doneOpen}
                >
                  <ChevronDownIcon className={`group__chevron${collapsed ? ' is-collapsed' : ''}`} />
                  <span className={`group__dot group__dot--${group.key}`} />
                  <span className="group__label">{group.label}</span>
                  <span className="group__count">{group.items.length}</span>
                </button>
              ) : (
                <>
                  <span className={`group__dot group__dot--${group.key}`} />
                  <h2 className="group__label">{group.label}</h2>
                  <span className="group__count">{group.items.length}</span>
                </>
              )}
              {isDone && onClearCompleted && (
                clearConfirm ? (
                  <span className="group__clear-confirm">
                    비우기?
                    <button
                      type="button"
                      className="group__clear group__clear--yes"
                      onClick={() => { onClearCompleted(); setClearConfirm(false) }}
                    >
                      확인
                    </button>
                    <button type="button" className="group__clear" onClick={() => setClearConfirm(false)}>
                      취소
                    </button>
                  </span>
                ) : (
                  <button type="button" className="group__clear" onClick={() => setClearConfirm(true)}>
                    완료 비우기
                  </button>
                )
              )}
            </div>
            {!collapsed && (
              <ul className="group__items">
                {group.items.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReschedule={onReschedule}
                    onSetPriority={onSetPriority}
                    exiting={exitingId === todo.id}
                    busy={busyId === todo.id}
                  />
                ))}
              </ul>
            )}
          </section>
        )
      })}

      <div ref={sentinelRef} className="todo-list__sentinel">
        {loading && <span className="spinner" aria-label="불러오는 중" />}
        {!hasNext && <span className="state state--muted">모두 불러왔습니다</span>}
      </div>
    </>
  )
}
