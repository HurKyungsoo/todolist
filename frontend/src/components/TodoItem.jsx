import { useState } from 'react'
import { formatDateTime, isOverdue, timeLeftLabel } from '../utils/date'
import { PencilIcon, TrashIcon } from './icons'

export default function TodoItem({ todo, onToggle, onEdit, onDelete, busy }) {
  const overdue = isOverdue(todo)
  const soon = !todo.completed && todo.dueSoon
  const [confirming, setConfirming] = useState(false)

  const cls = [
    'todo-item',
    todo.completed && 'is-done',
    !todo.completed && overdue && 'is-overdue',
    !todo.completed && !overdue && soon && 'is-soon',
  ].filter(Boolean).join(' ')

  return (
    <li className={cls}>
      <input
        type="checkbox"
        className="todo-item__check"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        disabled={busy}
        aria-label={todo.completed ? '완료 취소' : '완료 처리'}
      />

      <div className="todo-item__body">
        <div className="todo-item__head">
          <span className="todo-item__title">{todo.title}</span>
          {todo.category && <span className="tag">{todo.category}</span>}
          {soon && !overdue && <span className="tag tag--warn">마감 임박</span>}
          {overdue && <span className="tag tag--danger">기한 초과</span>}
        </div>

        {todo.content && <p className="todo-item__content">{todo.content}</p>}

        <div className="todo-item__meta">
          <span>{formatDateTime(todo.dueDate)}</span>
          {todo.dueDate && !todo.completed && (
            <>
              <span className="dot" />
              <span className={overdue ? 'text-danger' : soon ? 'text-warn' : ''}>
                {timeLeftLabel(todo.dueDate)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="todo-item__actions">
        {confirming ? (
          <span className="todo-item__confirm">
            삭제?
            <button className="btn btn--danger btn--sm" disabled={busy}
              onClick={() => onDelete(todo)}>확인</button>
            <button className="btn btn--ghost btn--sm"
              onClick={() => setConfirming(false)}>취소</button>
          </span>
        ) : (
          <>
            <button className="icon-btn" onClick={() => onEdit(todo)} disabled={busy} aria-label="수정" title="수정">
              <PencilIcon />
            </button>
            <button className="icon-btn icon-btn--danger" onClick={() => setConfirming(true)} disabled={busy} aria-label="삭제" title="삭제">
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
