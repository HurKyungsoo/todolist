import { formatDateTime, isOverdue, timeLeftLabel } from '../utils/date'

export default function TodoItem({ todo, onToggle, onEdit, onDelete, busy }) {
  const overdue = isOverdue(todo)

  return (
    <li className={`todo-item ${todo.completed ? 'is-done' : ''}`}>
      <input
        type="checkbox"
        className="todo-item__check"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        disabled={busy}
        aria-label="완료 여부"
      />

      <div className="todo-item__body">
        <div className="todo-item__head">
          <span className="todo-item__title">{todo.title}</span>
          {todo.category && <span className="tag">{todo.category}</span>}
          {!todo.completed && todo.dueSoon && <span className="tag tag--warn">마감 임박</span>}
          {overdue && <span className="tag tag--danger">기한 초과</span>}
          {todo.completed && <span className="tag tag--ok">완료</span>}
        </div>

        {todo.content && <p className="todo-item__content">{todo.content}</p>}

        <div className="todo-item__meta">
          <span>📅 {formatDateTime(todo.dueDate)}</span>
          {todo.dueDate && !todo.completed && (
            <span className={overdue ? 'text-danger' : todo.dueSoon ? 'text-warn' : ''}>
              {timeLeftLabel(todo.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="todo-item__actions">
        <button className="btn btn--ghost btn--sm" onClick={() => onEdit(todo)} disabled={busy}>
          수정
        </button>
        <button className="btn btn--danger btn--sm" onClick={() => onDelete(todo)} disabled={busy}>
          삭제
        </button>
      </div>
    </li>
  )
}
