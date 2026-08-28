import { useEffect, useRef, useState } from 'react'
import { CalendarIcon, ChevronDownIcon, ClockIcon } from './icons'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const DAY_END = { h: 23, m: 59 } // 퀵 칩·달력 기본 시각 = 그날 끝
const pad = (n) => String(n).padStart(2, '0')

// datetime-local 값('yyyy-MM-ddTHH:mm') ↔ Date
function parseValue(v) {
  const m = v && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v)
  if (!m) return null
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  return Number.isNaN(d.getTime()) ? null : d
}
function toValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function atDate(y, mo, day, h, mi) {
  return new Date(y, mo, day, h, mi, 0, 0)
}
function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function atMidnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}
function shiftMonth(view, delta) {
  const d = new Date(view.y, view.m + delta, 1)
  return { y: d.getFullYear(), m: d.getMonth() }
}
// 6주(42칸) 그리드 — 앞뒤 달 날짜 포함
function monthGrid(y, m) {
  const first = new Date(y, m, 1)
  const gridStart = addDays(first, -first.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

// 값 줄에 쓰는 날짜 라벨 (시간 제외 — 시간은 옆의 time 입력에서 표시)
function dateLabel(d) {
  const now = new Date()
  const dd = Math.round((atMidnight(d) - atMidnight(now)) / 86_400_000)
  if (dd === 0) return '오늘'
  if (dd === 1) return '내일'
  if (dd === -1) return '어제'
  const yearPart = d.getFullYear() === now.getFullYear() ? '' : `${d.getFullYear()}년 `
  return `${yearPart}${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`
}

// 퀵 칩: 오늘 / 내일 / 이번 주말(다가오는 토요일) — 모두 23:59
function quickChips() {
  const now = new Date()
  const toEnd = (d) => atDate(d.getFullYear(), d.getMonth(), d.getDate(), DAY_END.h, DAY_END.m)
  return [
    { key: 'today', label: '오늘', date: toEnd(now) },
    { key: 'tomorrow', label: '내일', date: toEnd(addDays(now, 1)) },
    { key: 'weekend', label: '이번 주말', date: toEnd(addDays(now, (6 - now.getDay() + 7) % 7)) },
  ]
}

export default function DateTimePicker({ value, onChange }) {
  const selected = parseValue(value)
  const [open, setOpen] = useState(false) // 달력 팝오버
  const [mode, setMode] = useState('days') // 'days' | 'months'
  const [view, setView] = useState(() => {
    const b = selected ?? new Date()
    return { y: b.getFullYear(), m: b.getMonth() }
  })
  const rootRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    panelRef.current?.scrollIntoView({ block: 'nearest' })
    const onDocDown = (e) => {
      if (!rootRef.current || !rootRef.current.contains(e.target)) setOpen(false)
    }
    // 캡처 단계 — 모달 패널이 mousedown 전파를 막으므로(Modal.jsx) 버블 단계로는 못 받음
    document.addEventListener('mousedown', onDocDown, true)
    return () => document.removeEventListener('mousedown', onDocDown, true)
  }, [open])

  const commit = (d) => onChange(toValue(d))
  const clear = () => { onChange(''); setOpen(false) }

  const openCal = () => {
    const b = parseValue(value) ?? new Date()
    setView({ y: b.getFullYear(), m: b.getMonth() })
    setMode('days')
    setOpen(true)
  }
  const toggleCal = () => (open ? setOpen(false) : openCal())

  const onChipClick = (date) => {
    if (selected && sameDay(selected, date)) clear() // 토글 해제
    else { commit(date); setOpen(false) }
  }

  // 날짜만 고르면 달력은 닫힌다 — 시간은 값 줄의 time 입력에서 조정
  const pickDay = (day) => {
    commit(atDate(
      day.getFullYear(), day.getMonth(), day.getDate(),
      selected ? selected.getHours() : DAY_END.h,
      selected ? selected.getMinutes() : DAY_END.m,
    ))
    setOpen(false)
  }
  const onTimeChange = (e) => {
    const [h, mi] = e.target.value.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(mi)) return
    const d = selected ?? new Date()
    commit(atDate(d.getFullYear(), d.getMonth(), d.getDate(), h, mi))
  }

  const today = new Date()
  const chips = quickChips()
  const activeChip = selected ? chips.find((c) => sameDay(selected, c.date))?.key : null

  return (
    <div className="dtp" ref={rootRef}>
      <div className="dtp-chips">
        {chips.map((c) => (
          <button
            type="button"
            key={c.key}
            className={`dtp-chip${c.key === activeChip ? ' is-active' : ''}`}
            onClick={() => onChipClick(c.date)}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          className={`dtp-chip dtp-chip--cal${open ? ' is-active' : ''}`}
          onClick={toggleCal}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <CalendarIcon className="dtp-chip__icon" />
          날짜 선택
        </button>
      </div>

      {selected && (
        <div className="dtp-value">
          <button type="button" className="dtp-value__date" onClick={toggleCal}>
            <ClockIcon className="dtp-value__icon" />
            {dateLabel(selected)}
          </button>
          <input
            type="time"
            className="input input--sm dtp-value__time"
            value={`${pad(selected.getHours())}:${pad(selected.getMinutes())}`}
            onChange={onTimeChange}
            aria-label="시각"
          />
          <button type="button" className="dtp-clear" onClick={clear}>지우기</button>
        </div>
      )}

      {open && (
        <div className="dtp-panel" role="dialog" aria-label="날짜 선택" ref={panelRef}>
          {mode === 'days' ? (
            <>
              <div className="dtp-cal__head">
                <button type="button" className="dtp-nav dtp-nav--prev" onClick={() => setView((v) => shiftMonth(v, -1))} aria-label="이전 달">
                  <ChevronDownIcon />
                </button>
                <button type="button" className="dtp-cal__title" onClick={() => setMode('months')} aria-label="연·월 선택">
                  {view.y}년 {view.m + 1}월
                </button>
                <button type="button" className="dtp-nav dtp-nav--next" onClick={() => setView((v) => shiftMonth(v, 1))} aria-label="다음 달">
                  <ChevronDownIcon />
                </button>
              </div>

              <div className="dtp-cal__grid dtp-cal__grid--dow">
                {WEEKDAYS.map((w) => <span key={w} className="dtp-dow">{w}</span>)}
              </div>
              <div className="dtp-cal__grid">
                {monthGrid(view.y, view.m).map((day) => {
                  const cls = [
                    'dtp-day',
                    day.getMonth() !== view.m && 'is-outside',
                    sameDay(day, today) && 'is-today',
                    selected && sameDay(day, selected) && 'is-selected',
                  ].filter(Boolean).join(' ')
                  return (
                    <button
                      type="button"
                      key={day.getTime()}
                      className={cls}
                      aria-label={`${day.getFullYear()}년 ${day.getMonth() + 1}월 ${day.getDate()}일`}
                      onClick={() => pickDay(day)}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <div className="dtp-cal__head">
                <button type="button" className="dtp-nav dtp-nav--prev" onClick={() => setView((v) => ({ ...v, y: v.y - 1 }))} aria-label="이전 해">
                  <ChevronDownIcon />
                </button>
                <button type="button" className="dtp-cal__title" onClick={() => setMode('days')} aria-label="날짜로 돌아가기">
                  {view.y}년
                </button>
                <button type="button" className="dtp-nav dtp-nav--next" onClick={() => setView((v) => ({ ...v, y: v.y + 1 }))} aria-label="다음 해">
                  <ChevronDownIcon />
                </button>
              </div>
              <div className="dtp-months">
                {Array.from({ length: 12 }, (_, mo) => {
                  const cls = [
                    'dtp-month',
                    today.getFullYear() === view.y && today.getMonth() === mo && 'is-today',
                    selected && selected.getFullYear() === view.y && selected.getMonth() === mo && 'is-selected',
                  ].filter(Boolean).join(' ')
                  return (
                    <button
                      type="button"
                      key={mo}
                      className={cls}
                      onClick={() => { setView((v) => ({ ...v, m: mo })); setMode('days') }}
                    >
                      {mo + 1}월
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
