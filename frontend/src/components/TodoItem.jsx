import { useEffect, useRef, useState } from 'react'
import { formatDueDate, isOverdue, quickDueOptions, timeLeftLabel } from '../utils/date'
import { PRIORITIES, priorityMeta } from '../priorities'
import { recurrenceLabel } from '../recurrences'
import { categoryStyle } from '../categories'
import { ClockIcon, FlagIcon, GripIcon, PencilIcon, RepeatIcon, SnoozeIcon, TrashIcon } from './icons'
import ActionMenu from './ActionMenu'

const PRIORITY_OPTIONS = PRIORITIES.map((p) => ({ key: String(p.value), label: p.label, value: p.value }))

export default function TodoItem({
  todo, onToggle, onEdit, onDelete, onReschedule, onSetPriority, exiting, busy, dragProps,
}) {
  const overdue = isOverdue(todo)
  const soon = !todo.completed && todo.dueSoon
  const prio = priorityMeta(todo.priority)
  const showPrio = !todo.completed && todo.priority !== 1
  const catStyle = categoryStyle(todo.category)
  const recur = recurrenceLabel(todo.recurrence)
  const [confirming, setConfirming] = useState(false)
  const canReschedule = !todo.completed && (overdue || soon)

  const contentRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  useEffect(() => {
    const el = contentRef.current
    if (el && el.scrollHeight > el.clientHeight + 1) setCanExpand(true)
  }, [todo.content])

  const cls = [
    'todo-item',
    todo.completed && 'is-done',
    exiting && 'is-exiting',
    dragProps && 'is-sortable',
  ].filter(Boolean).join(' ')

  const dueState = todo.completed
    ? 'done'
    : overdue
      ? 'overdue'
      : soon
        ? 'soon'
        : 'normal'
  const urgent = dueState === 'soon' || dueState === 'overdue'
  const showCountdown = !!todo.dueDate && !todo.completed
  const showDue = !!todo.dueDate // 마감일 없는 항목은 칩을 아예 표시하지 않음

  return (
    <li className={cls} {...(dragProps?.li ?? {})}>
      {dragProps && (
        <button
          type="button"
          className="todo-item__grip"
          aria-label="드래그로 순서 변경"
          title="드래그로 순서 변경"
          {...dragProps.handle}
        >
          <GripIcon />
        </button>
      )}

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
          {showPrio && (
            <span className={`prio prio--${prio.tone}`} title={`우선순위 ${prio.label}`}>
              {prio.label}
            </span>
          )}
          <span className="todo-item__title">{todo.title}</span>
          {recur && (
            <span className="recur" title={`${recur} 반복`}>
              <RepeatIcon className="recur__icon" />
              {recur}
            </span>
          )}
          {todo.category && (
            <span className="tag" style={catStyle}>
              <span className="tag__dot" />
              {todo.category}
            </span>
          )}
        </div>

        {todo.content && (
          <>
            <p
              ref={contentRef}
              className={`todo-item__content${expanded ? ' is-expanded' : ''}`}
            >
              {todo.content}
            </p>
            {canExpand && (
              <button
                type="button"
                className="todo-item__more"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? '접기' : '더보기'}
              </button>
            )}
          </>
        )}

        {showDue && (
          <div className="todo-item__meta">
            <span className={`due due--${dueState}`}>
              {urgent
                ? <span className="due__pulse" aria-hidden="true" />
                : <ClockIcon className="due__icon" />}
              <span className="due__date">{formatDueDate(todo.dueDate)}</span>
              {showCountdown && (
                <>
                  <span className="due__sep" aria-hidden="true" />
                  <span className="due__left">{timeLeftLabel(todo.dueDate)}</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {confirming ? (
        <div className="todo-item__confirm">
          삭제?
          <button
            type="button"
            className="todo-item__confirm-btn todo-item__confirm-btn--yes"
            onClick={() => onDelete(todo)}
            disabled={busy}
          >
            확인
          </button>
          <button
            type="button"
            className="todo-item__confirm-btn"
            onClick={() => setConfirming(false)}
          >
            취소
          </button>
        </div>
      ) : (
        <div className="todo-item__actions">
          {!todo.completed && (
            <ActionMenu
              icon={<FlagIcon />}
              ariaLabel="우선순위"
              options={PRIORITY_OPTIONS}
              activeValue={todo.priority}
              onPick={(value) => onSetPriority(todo, value)}
              disabled={busy}
            />
          )}
          {canReschedule && (
            <ActionMenu
              icon={<SnoozeIcon />}
              ariaLabel="미루기"
              options={quickDueOptions()}
              onPick={(value) => onReschedule(todo, value)}
              disabled={busy}
            />
          )}
          <button className="icon-btn" onClick={() => onEdit(todo)} disabled={busy} aria-label="수정" title="수정">
            <PencilIcon />
          </button>
          <button className="icon-btn icon-btn--danger" onClick={() => setConfirming(true)} disabled={busy} aria-label="삭제" title="삭제">
            <TrashIcon />
          </button>
        </div>
      )}
    </li>
  )
}
