import { useRef, useState } from 'react'
import TodoItem from './TodoItem'

// '직접 정렬' 모드 — 그룹 없이 평면 목록, 드래그로 순서 변경.
export default function SortableList({
  items, onToggle, onEdit, onDelete, onReschedule, onSetPriority, onReorder, exitingId, busyId,
}) {
  const draggingRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)
  const [order, setOrder] = useState(null) // 드래그 중에만 로컬 순서 유지

  const view = order
    ? order.map((id) => items.find((t) => t.id === id)).filter(Boolean)
    : items

  const start = (id) => {
    draggingRef.current = id
    setDraggingId(id)
    setOrder(items.map((t) => t.id))
  }
  const enter = (overId) => {
    setOrder((prev) => {
      if (!prev) return prev
      const from = prev.indexOf(draggingRef.current)
      const to = prev.indexOf(overId)
      if (from < 0 || to < 0 || from === to) return prev
      const next = prev.slice()
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })
  }
  const end = () => {
    const finalOrder = order
    draggingRef.current = null
    setDraggingId(null)
    setOrder(null)
    if (finalOrder) onReorder(finalOrder)
  }

  return (
    <ul className="todo-list">
      {view.map((todo) => (
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
          dragProps={{
            li: {
              onDragEnter: () => enter(todo.id),
              onDragOver: (e) => e.preventDefault(),
              'data-dragging': draggingId === todo.id || undefined,
            },
            handle: {
              draggable: true,
              onDragStart: (e) => { e.dataTransfer.effectAllowed = 'move'; start(todo.id) },
              onDragEnd: end,
            },
          }}
        />
      ))}
    </ul>
  )
}
