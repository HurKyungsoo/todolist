import { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import TodoForm from '../components/TodoForm'
import TodoList from '../components/TodoList'
import useTodos from '../hooks/useTodos'
import { PlusIcon } from '../components/icons'
import { toMessage } from '../api/client'
import { createTodo, deleteTodo, toggleComplete, updateTodo } from '../api/todos'

export default function TodosPage() {
  const [category, setCategory] = useState('')
  const [completed, setCompleted] = useState('') // '', 'true', 'false'
  const [sort, setSort] = useState('dueDate')

  const filters = useMemo(
    () => ({ category: category.trim(), completed, sort }),
    [category, completed, sort],
  )

  const {
    items, total, loading, error, hasNext,
    loadMore, refresh, patchItem, removeItem,
  } = useTodos(filters)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (todo) => {
    setEditing(todo)
    setFormOpen(true)
  }
  const closeForm = () => {
    if (!submitting) setFormOpen(false)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setActionError('')
    try {
      if (editing) {
        await updateTodo(editing.id, payload)
      } else {
        await createTodo(payload)
      }
      setFormOpen(false)
      refresh()
    } catch (err) {
      setActionError(toMessage(err, '저장에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (todo) => {
    setBusyId(todo.id)
    setActionError('')
    try {
      const updated = await toggleComplete(todo.id)
      // 완료 필터가 걸려 있으면 목록에서 빠질 수 있음
      if (completed !== '' && String(updated.completed) !== completed) {
        removeItem(todo.id)
      } else {
        patchItem(todo.id, () => updated)
      }
    } catch (err) {
      setActionError(toMessage(err, '완료 처리에 실패했습니다.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (todo) => {
    // 삭제 확인은 TodoItem 내부 인라인 UI 에서 처리
    setBusyId(todo.id)
    setActionError('')
    try {
      await deleteTodo(todo.id)
      removeItem(todo.id)
    } catch (err) {
      setActionError(toMessage(err, '삭제에 실패했습니다.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <div className="toolbar">
          <div className="toolbar__filters">
            <input
              className="input input--sm"
              placeholder="카테고리 검색"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <select className="input input--sm" value={completed} onChange={(e) => setCompleted(e.target.value)}>
              <option value="">전체 상태</option>
              <option value="false">미완료</option>
              <option value="true">완료</option>
            </select>
            <select className="input input--sm" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="dueDate">마감일 순</option>
              <option value="createdAt,desc">최근 생성 순</option>
              <option value="title">제목 순</option>
            </select>
          </div>
          <button className="btn btn--primary" onClick={openCreate}>
            <PlusIcon width={15} height={15} /> 새 할 일
          </button>
        </div>

        <p className="count">전체 {total}건</p>
        {actionError && <p className="form-error">{actionError}</p>}

        <TodoList
          items={items}
          loading={loading}
          error={error}
          hasNext={hasNext}
          onLoadMore={loadMore}
          onToggle={handleToggle}
          onEdit={openEdit}
          onDelete={handleDelete}
          busyId={busyId}
        />
      </main>

      <Modal open={formOpen} onClose={closeForm}>
        <TodoForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitting={submitting}
        />
        {actionError && formOpen && <p className="form-error">{actionError}</p>}
      </Modal>
    </div>
  )
}
