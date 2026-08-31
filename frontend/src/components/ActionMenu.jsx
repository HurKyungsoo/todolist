import { useEffect, useRef, useState } from 'react'

// 카드 액션용 작은 팝오버 메뉴. options: [{ key, label, value }]
export default function ActionMenu({ icon, ariaLabel, options, activeValue, onPick, disabled }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [open])

  const pick = (value) => {
    setOpen(false)
    onPick(value)
  }

  return (
    <div className="action-menu" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        title={ariaLabel}
      >
        {icon}
      </button>
      {open && (
        <div className="action-menu__list" role="menu">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              role="menuitem"
              className={`action-menu__item${o.value === activeValue ? ' is-active' : ''}`}
              onClick={() => pick(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
