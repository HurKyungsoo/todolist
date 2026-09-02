// 미리 정의된 카테고리 — 새 할 일 폼의 선택 칩과 목록 필터에서 공용으로 쓴다.
export const CATEGORIES = ['업무', '개인', '공부', '건강', '집안일', '약속']

// 카테고리별 고정 색상(hue). 목록에 없는 값은 문자열 해시로 hue 를 만든다.
const CAT_HUES = {
  업무: 275, 개인: 150, 공부: 55, 건강: 190,
  집안일: 25, 쇼핑: 330, 약속: 10, 취미: 100,
}

function hashHue(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 360
  return h
}

// 카테고리 태그의 배경/글자색 (자동 톤). 카테고리가 없으면 null.
export function categoryStyle(category) {
  if (!category) return null
  const hue = CAT_HUES[category] ?? hashHue(category)
  return {
    background: `oklch(94% 0.05 ${hue})`,
    color: `oklch(45% 0.15 ${hue})`,
  }
}
