// 반복 — 서버는 null | DAILY | WEEKLY | MONTHLY 로 저장.
export const RECURRENCES = [
  { value: null, label: '없음' },
  { value: 'DAILY', label: '매일' },
  { value: 'WEEKLY', label: '매주' },
  { value: 'MONTHLY', label: '매월' },
]

export function recurrenceLabel(value) {
  if (!value) return null
  return RECURRENCES.find((r) => r.value === value)?.label ?? null
}
