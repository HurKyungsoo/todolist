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

// 화면 표시용 포맷 (예: 2026. 8. 29. 09:00)
export function formatDateTime(serverValue) {
  if (!serverValue) return '마감일 없음'
  const d = new Date(serverValue)
  if (Number.isNaN(d.getTime())) return serverValue
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const body = h >= 24 ? `${Math.floor(h / 24)}일` : h >= 1 ? `${h}시간` : `${m}분`
  return diffMs >= 0 ? `${body} 남음` : `${body} 지남`
}
