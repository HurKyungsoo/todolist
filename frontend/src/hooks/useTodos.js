import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchTodos } from '../api/todos'
import { toMessage } from '../api/client'

// 그룹 뷰(기한 초과/오늘/예정/완료)는 로드된 항목만 집계하므로, 개인 규모에선
// 한 번에 다 불러와 그룹·개수가 정확하게 맞도록 크게 잡는다. 초과분은 무한 스크롤로 이어 로드.
const PAGE_SIZE = 100

// 무한 스크롤용 Todo 목록 상태 관리.
// filters 가 바뀌면 처음부터 다시 로드한다.
export default function useTodos(filters) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(true)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 오래된 응답이 최신 상태를 덮어쓰지 않도록 요청 세대 추적
  const reqId = useRef(0)
  const filterKey = JSON.stringify(filters)

  const load = useCallback(
    async (nextPage) => {
      const myReq = ++reqId.current
      setLoading(true)
      setError('')
      try {
        const data = await fetchTodos({ ...filters, page: nextPage, size: PAGE_SIZE })
        if (myReq !== reqId.current) return
        setItems((prev) => (nextPage === 0 ? data.content : [...prev, ...data.content]))
        setPage(nextPage)
        setHasNext(!data.last)
        setTotal(data.totalElements)
      } catch (err) {
        if (myReq !== reqId.current) return
        setError(toMessage(err, '목록을 불러오지 못했습니다.'))
      } finally {
        if (myReq === reqId.current) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey],
  )

  // 필터 변경 시 리셋 후 첫 페이지 로드
  useEffect(() => {
    setItems([])
    setHasNext(true)
    load(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  const loadMore = useCallback(() => {
    if (!loading && hasNext) load(page + 1)
  }, [loading, hasNext, page, load])

  const refresh = useCallback(() => load(0), [load])

  // 낙관적 업데이트 헬퍼
  const patchItem = useCallback((id, updater) => {
    setItems((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
    setTotal((n) => Math.max(0, n - 1))
  }, [])

  // 드래그 정렬: 새 id 순서대로 재배열
  const reorderItems = useCallback((ids) => {
    setItems((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]))
      return ids.map((id) => byId.get(id)).filter(Boolean)
    })
  }, [])

  return {
    items, total, loading, error, hasNext,
    loadMore, refresh, patchItem, removeItem, reorderItems,
  }
}
