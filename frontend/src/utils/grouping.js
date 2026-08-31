import { isOverdue } from './date'

function isDueToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

// 로드된 항목을 기한 초과 / 오늘 / 예정 / 완료 로 버킷팅한다. 빈 그룹은 반환하지 않는다.
export function groupTodos(items) {
  const buckets = { overdue: [], today: [], upcoming: [], done: [] }
  for (const t of items) {
    if (t.completed) buckets.done.push(t)
    else if (isOverdue(t)) buckets.overdue.push(t)
    else if (isDueToday(t.dueDate)) buckets.today.push(t)
    else buckets.upcoming.push(t)
  }
  return [
    { key: 'overdue', label: '기한 초과', items: buckets.overdue },
    { key: 'today', label: '오늘', items: buckets.today },
    { key: 'upcoming', label: '예정', items: buckets.upcoming },
    { key: 'done', label: '완료', items: buckets.done },
  ].filter((g) => g.items.length > 0)
}
