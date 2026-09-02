import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import TodoForm from '../components/TodoForm'
import TodoList from '../components/TodoList'
import useTodos from '../hooks/useTodos'
import useDebounced from '../hooks/useDebounced'
import { PlusIcon } from '../components/icons'
import { CATEGORIES } from '../categories'
import { DEFAULT_PRIORITY } from '../priorities'
import { formatToday, isOverdue } from '../utils/date'
import { toMessage } from '../api/client'
import {
  clearCompleted, createTodo, deleteTodo, fetchCategories, fetchStats, reorderTodos, toggleComplete, updateTodo,
} from '../api/todos'

const EXIT_MS = 220

const STATUS_TABS = [
  { value: 'false', label: '미완료' },
  { value: 'true', label: '완료' },
  { value: '', label: '전체' },
]

export default function TodosPage() {
  // 필터(상태·카테고리·정렬)는 URL 쿼리에 저장 — 새로고침/뒤로가기 시 유지된다. 기본은 '미완료'.
  const [params, setParams] = useSearchParams()
  const completed =
    params.get('status') === 'all' ? '' : params.get('status') === 'done' ? 'true' : 'false'
  const category = params.get('cat') ?? ''
  const sort = params.get('sort') ?? 'dueDate'
  const view = params.get('view') ?? '' // '' | 'overdue' — 상단 스탯 카드의 클라이언트 필터

  const patchParams = useCallback((patch) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === '') next.delete(k)
        else next.set(k, v)
      }
      return next
    }, { replace: true })
  }, [setParams])

  const setCompleted = (v) =>
    patchParams({ status: v === '' ? 'all' : v === 'true' ? 'done' : null, view: null })
  const setCategory = (v) => patchParams({ cat: v })

  // 상단 스탯 카드 → 관련 목록으로 이동
  const showAll = () => patchParams({ status: 'all', view: null })
  const showActive = () => patchParams({ status: null, view: null })
  const showOverdue = () => patchParams({ status: null, view: 'overdue' })
  const setSort = (v) => patchParams({ sort: v === 'dueDate' ? null : v })

  const manualSort = sort === 'sortOrder'

  const [search, setSearch] = useState('')
  const q = useDebounced(search.trim(), 300)

  const filters = useMemo(
    () => ({ category: category.trim(), completed, sort, q }),
    [category, completed, sort, q],
  )

  const {
    items, loading, error, hasNext,
    loadMore, refresh, patchItem, removeItem, reorderItems,
  } = useTodos(filters)

  // '기한 초과' 카드: 서버 필터가 없어 로드된 미완료 항목에서 클라이언트로 추린다
  const visibleItems = useMemo(
    () => (view === 'overdue' ? items.filter(isOverdue) : items),
    [items, view],
  )

  const [stats, setStats] = useState(null)
  const loadStats = useCallback(() => {
    fetchStats().then(setStats).catch(() => {})
  }, [])

  const [userCats, setUserCats] = useState([])
  const loadCats = useCallback(() => {
    fetchCategories().then(setUserCats).catch(() => {})
  }, [])

  useEffect(() => { loadStats(); loadCats() }, [loadStats, loadCats])

  const categoryOptions = useMemo(() => {
    const set = new Set(CATEGORIES)
    for (const c of userCats) if (c) set.add(c)
    return [...set]
  }, [userCats])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [exitingId, setExitingId] = useState(null)
  const [actionError, setActionError] = useState('')

  const [quickTitle, setQuickTitle] = useState('')
  const [quickBusy, setQuickBusy] = useState(false)

  // 목록에서 빠지는 항목을 잠깐 페이드아웃한 뒤 제거
  const animateRemove = useCallback((id) => {
    setExitingId(id)
    window.setTimeout(() => {
      removeItem(id)
      setExitingId((cur) => (cur === id ? null : cur))
    }, EXIT_MS)
  }, [removeItem])

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

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    const title = quickTitle.trim()
    if (!title || quickBusy) return
    setQuickBusy(true)
    setActionError('')
    try {
      await createTodo({ title, content: null, dueDate: null, category: null, priority: DEFAULT_PRIORITY })
      setQuickTitle('')
      refresh()
      loadStats()
    } catch (err) {
      setActionError(toMessage(err, '추가에 실패했습니다.'))
    } finally {
      setQuickBusy(false)
    }
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
      loadStats()
      loadCats()
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
      // 상태 필터가 걸려 있으면 목록에서 빠질 수 있음
      if (completed !== '' && String(updated.completed) !== completed) {
        animateRemove(todo.id)
      } else {
        patchItem(todo.id, () => updated)
      }
      // 반복 항목을 완료하면 서버가 다음 회차를 생성 → 목록 새로고침
      if (todo.recurrence && updated.completed) {
        window.setTimeout(refresh, EXIT_MS)
      }
      loadStats()
    } catch (err) {
      setActionError(toMessage(err, '완료 처리에 실패했습니다.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (todo) => {
    setBusyId(todo.id)
    setActionError('')
    try {
      await deleteTodo(todo.id)
      animateRemove(todo.id)
      loadStats()
    } catch (err) {
      setActionError(toMessage(err, '삭제에 실패했습니다.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleReschedule = async (todo, dueDate) => {
    setBusyId(todo.id)
    setActionError('')
    try {
      const updated = await updateTodo(todo.id, {
        title: todo.title,
        content: todo.content ?? null,
        dueDate,
        category: todo.category ?? null,
        priority: todo.priority,
        recurrence: todo.recurrence ?? null,
      })
      patchItem(todo.id, () => updated)
      loadStats()
    } catch (err) {
      setActionError(toMessage(err, '마감일 변경에 실패했습니다.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleSetPriority = async (todo, priority) => {
    if (priority === todo.priority) return
    setBusyId(todo.id)
    setActionError('')
    try {
      const updated = await updateTodo(todo.id, {
        title: todo.title,
        content: todo.content ?? null,
        dueDate: todo.dueDate ?? null,
        category: todo.category ?? null,
        priority,
        recurrence: todo.recurrence ?? null,
      })
      patchItem(todo.id, () => updated)
    } catch (err) {
      setActionError(toMessage(err, '우선순위 변경에 실패했습니다.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleClearCompleted = async () => {
    setActionError('')
    try {
      await clearCompleted()
      refresh()
      loadStats()
      loadCats()
    } catch (err) {
      setActionError(toMessage(err, '완료 항목 삭제에 실패했습니다.'))
    }
  }

  const handleReorder = async (ids) => {
    reorderItems(ids) // 낙관적
    try {
      await reorderTodos(ids)
    } catch (err) {
      setActionError(toMessage(err, '순서 저장에 실패했습니다.'))
      refresh()
    }
  }

  const s = stats ?? { total: 0, active: 0, overdue: 0, donePct: 0 }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <p className="today-line">
          오늘 <b>{formatToday()}</b>
        </p>

        <div className="stat-grid">
          <button
            type="button"
            className={`stat-card${completed === '' && view !== 'overdue' ? ' is-active' : ''}`}
            onClick={showAll}
          >
            <div className="stat-card__label">전체</div>
            <div className="stat-card__value">{s.total}</div>
          </button>
          <button
            type="button"
            className={`stat-card stat-card--active${completed === 'false' && view !== 'overdue' ? ' is-active' : ''}`}
            onClick={showActive}
          >
            <div className="stat-card__label">미완료</div>
            <div className="stat-card__value">{s.active}</div>
          </button>
          <button
            type="button"
            className={`stat-card stat-card--overdue${view === 'overdue' ? ' is-active' : ''}`}
            onClick={showOverdue}
          >
            <div className="stat-card__label">기한 초과</div>
            <div className="stat-card__value">{s.overdue}</div>
          </button>
          <div className="stat-card stat-card--done">
            <div className="stat-card__label">완료율</div>
            <div className="stat-card__value">{s.donePct}%</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-bar__group">
            <div className="seg" role="tablist" aria-label="완료 상태">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={completed === tab.value}
                  className={`seg__btn${completed === tab.value ? ' is-active' : ''}`}
                  onClick={() => setCompleted(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <input
              className="pill-input"
              placeholder="제목·내용 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="pill-input" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="카테고리">
              <option value="">전체 카테고리</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="pill-input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="정렬">
              <option value="dueDate">마감일 순</option>
              <option value="priority,desc">우선순위 순</option>
              <option value="createdAt,desc">최근 생성 순</option>
              <option value="title">제목 순</option>
              <option value="sortOrder">직접 정렬</option>
            </select>
          </div>
          <button className="btn btn--primary btn--pill" onClick={openCreate}>
            <PlusIcon width={14} height={14} /> 새 할 일
          </button>
        </div>

        <form className="quick-add" onSubmit={handleQuickAdd}>
          <PlusIcon className="quick-add__icon" width={15} height={15} />
          <input
            className="quick-add__input"
            placeholder="빠른 추가 — 제목 입력 후 Enter"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            maxLength={200}
            aria-label="빠른 추가"
          />
          {quickTitle.trim() && (
            <button type="submit" className="btn btn--primary btn--pill btn--sm" disabled={quickBusy}>
              추가
            </button>
          )}
        </form>

        {actionError && <p className="form-error">{actionError}</p>}

        <TodoList
          items={visibleItems}
          loading={loading}
          error={error}
          hasNext={hasNext}
          statusFilter={completed}
          manualSort={manualSort}
          onLoadMore={loadMore}
          onToggle={handleToggle}
          onEdit={openEdit}
          onDelete={handleDelete}
          onReschedule={handleReschedule}
          onSetPriority={handleSetPriority}
          onClearCompleted={handleClearCompleted}
          onReorder={handleReorder}
          exitingId={exitingId}
          busyId={busyId}
        />
      </main>

      <Modal open={formOpen} onClose={closeForm}>
        <TodoForm
          initial={editing}
          categoryOptions={categoryOptions}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          submitting={submitting}
        />
        {actionError && formOpen && <p className="form-error">{actionError}</p>}
      </Modal>
    </div>
  )
}
