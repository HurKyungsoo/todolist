import { useEffect, useMemo, useState } from 'react'
import { toInputDateTime, toServerDateTime } from '../utils/date'
import { CATEGORIES } from '../categories'
import { DEFAULT_PRIORITY, PRIORITIES } from '../priorities'
import { RECURRENCES } from '../recurrences'
import DateTimePicker from './DateTimePicker'

const EMPTY = { title: '', content: '', dueDate: '', category: '', priority: DEFAULT_PRIORITY, recurrence: null }

// 생성/수정 겸용 폼. initial 이 있으면 수정 모드.
export default function TodoForm({ initial, categoryOptions: extraCategories = [], onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY)
  const isEdit = Boolean(initial)

  useEffect(() => {
    setForm(
      initial
        ? {
            title: initial.title ?? '',
            content: initial.content ?? '',
            dueDate: toInputDateTime(initial.dueDate),
            category: initial.category ?? '',
            priority: initial.priority ?? DEFAULT_PRIORITY,
            recurrence: initial.recurrence ?? null,
          }
        : EMPTY,
    )
  }, [initial])

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const pickCategory = (c) => setForm((f) => ({ ...f, category: f.category === c ? '' : c }))

  // 칩: 프리셋 + 다른 항목에서 이미 쓴 카테고리 + 지금 수정 중인 항목의 값
  const chipCategories = useMemo(() => {
    const set = new Set(CATEGORIES)
    for (const c of extraCategories) if (c) set.add(c)
    if (initial?.category) set.add(initial.category)
    return [...set]
  }, [extraCategories, initial])

  // form.category 가 칩에 없으면 직접 입력 중인 값으로 본다
  const inCustom = form.category !== '' && !chipCategories.includes(form.category)

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const dueDate = toServerDateTime(form.dueDate)
    onSubmit({
      title: form.title.trim(),
      content: form.content.trim() || null,
      dueDate,
      category: form.category.trim() || null,
      priority: form.priority,
      recurrence: dueDate ? form.recurrence : null, // 마감일 없으면 반복 무의미
    })
  }

  return (
    <form className="todo-form" onSubmit={submit}>
      <h2 className="todo-form__title">{isEdit ? '할 일 수정' : '새 할 일'}</h2>

      <label className="field">
        <span>제목 *</span>
        <input name="title" value={form.title} onChange={change} maxLength={200} required autoFocus />
      </label>

      <label className="field">
        <span>내용</span>
        <textarea name="content" value={form.content} onChange={change} rows={3} />
      </label>

      <div className="field">
        <span>마감일</span>
        <DateTimePicker
          value={form.dueDate}
          onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
        />
      </div>

      <div className="field">
        <span>카테고리</span>
        <div className="cat-chips">
          {chipCategories.map((c) => (
            <button
              type="button"
              key={c}
              className={`cat-chip${form.category === c ? ' is-active' : ''}`}
              onClick={() => pickCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="cat-custom"
          placeholder="직접 입력"
          value={inCustom ? form.category : ''}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          maxLength={50}
          aria-label="카테고리 직접 입력"
        />
      </div>

      <div className="field">
        <span>우선순위</span>
        <div className="cat-chips">
          {PRIORITIES.map((p) => (
            <button
              type="button"
              key={p.value}
              className={`cat-chip${form.priority === p.value ? ' is-active' : ''}`}
              onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>반복{!form.dueDate && form.recurrence ? ' (마감일 필요)' : ''}</span>
        <div className="cat-chips">
          {RECURRENCES.map((r) => (
            <button
              type="button"
              key={r.label}
              className={`cat-chip${form.recurrence === r.value ? ' is-active' : ''}`}
              onClick={() => setForm((f) => ({ ...f, recurrence: r.value }))}
              disabled={!form.dueDate && r.value !== null}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="todo-form__actions">
        <button type="button" className="btn btn--soft btn--pill" onClick={onCancel} disabled={submitting}>
          취소
        </button>
        <button type="submit" className="btn btn--primary btn--pill" disabled={submitting}>
          {submitting ? '저장 중…' : isEdit ? '수정' : '추가'}
        </button>
      </div>
    </form>
  )
}
