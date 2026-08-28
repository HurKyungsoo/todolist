// datetime-local 입력값('yyyy-MM-ddTHH:mm')을 서버 형식('yyyy-MM-ddTHH:mm:ss')으로
export function toServerDateTime(localValue) {
  if (!localValue) return null
  return localValue.length === 16 ? `${localValue}:00` : localValue
}

// 서버 dueDate → datetime-local 입력값
export function toInputDateTime(serverValue) {
  if (!serverValue) return ''
  return serverValue.slice(0, 16)
}

// 화면 표시용 마감일 포맷 — 가까운 날짜는 상대 표현 (예: '오늘 09:00', '8월 29일 (금) 09:00')
export function formatDueDate(serverValue) {
  if (!serverValue) return '마감일 없음'
  const d = new Date(serverValue)
  if (Number.isNaN(d.getTime())) return serverValue

  const now = new Date()
  const atMidnight = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dayDiff = Math.round((atMidnight(d) - atMidnight(now)) / 86_400_000)

  const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })

  if (dayDiff === 0) return `오늘 ${time}`
  if (dayDiff === 1) return `내일 ${time}`
  if (dayDiff === -1) return `어제 ${time}`

  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  const yearPart = d.getFullYear() === now.getFullYear() ? '' : `${d.getFullYear()}년 `
  return `${yearPart}${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday}) ${time}`
}

// 마감 지남 여부 (백엔드 dueSoon 과 별개로 프론트에서 계산)
export function isOverdue(todo) {
  if (todo.completed || !todo.dueDate) return false
  return new Date(todo.dueDate).getTime() < Date.now()
}

// 남은 시간 사람이 읽는 문자열
export function timeLeftLabel(serverValue) {
  if (!serverValue) return ''
  const diffMs = new Date(serverValue).getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const h = Math.floor(abs / 3_600_000)
  const m = Math.floor((abs % 3_600_000) / 60_000)
  const body = h >= 24 ? `${Math.floor(h / 24)}일` : h >= 1 ? `${h}시간` : m >= 1 ? `${m}분` : '1분'
  return diffMs >= 0 ? `${body} 남음` : `${body} 지남`
}
