// 우선순위 — 서버는 정수(0/1/2)로 저장, 화면은 라벨/색으로 표현.
export const DEFAULT_PRIORITY = 1

// 높은 순으로 나열 (폼 칩 순서와 동일)
export const PRIORITIES = [
  { value: 2, label: '높음', tone: 'high' },
  { value: 1, label: '보통', tone: 'mid' },
  { value: 0, label: '낮음', tone: 'low' },
]

export function priorityMeta(value) {
  return PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[1]
}
