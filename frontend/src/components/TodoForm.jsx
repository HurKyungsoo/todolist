import { useEffect, useState } from 'react'
import { toInputDateTime, toServerDateTime } from '../utils/date'
import DateTimePicker from './DateTimePicker'

const EMPTY = { title: '', content: '', dueDate: '', category: '' }

// 생성/수정 겸용 폼. initial 이 있으면 수정 모드.
export default function TodoForm({ initial, onSubmit, onCancel, submitting }) {
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
          }
        : EMPTY,
    )
  }, [initial])

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit({
      title: form.title.trim(),
      content: form.content.trim() || null,
      dueDate: toServerDateTime(form.dueDate),
      category: form.category.trim() || null,
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

      <label className="field">
        <span>카테고리</span>
        <input name="category" value={form.category} onChange={change} maxLength={50} placeholder="업무 / 개인 …" />
      </label>

      <div className="todo-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          취소
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? '저장 중…' : isEdit ? '수정' : '추가'}
        </button>
      </div>
    </form>
  )
}
