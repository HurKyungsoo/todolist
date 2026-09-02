import { Link } from 'react-router-dom'
import { InboxIcon, LogoIcon, PlusIcon } from '../components/icons'
import { formatToday } from '../utils/date'

const STATUS_TABS = ['미완료', '완료', '전체']
const STATS = [
  { label: '전체', value: 0 },
  { label: '미완료', value: 0, mod: 'stat-card--active' },
  { label: '기한 초과', value: 0, mod: 'stat-card--overdue' },
  { label: '완료율', value: '0%', mod: 'stat-card--done' },
]

// 로그아웃 상태의 '/' — 실제 화면 레이아웃을 그대로 보여주되 데이터는 비어 있고,
// 어떤 동작을 시도하든 로그인으로 유도한다.
export default function GuestHome() {
  return (
    <div className="page">
      <header className="navbar">
        <span className="navbar__brand">
          <span className="brand-mark"><LogoIcon /></span>
          Todolist
        </span>
        <div className="navbar__right">
          <Link to="/signup" className="btn btn--soft btn--sm btn--pill">회원가입</Link>
          <Link to="/login" className="btn btn--primary btn--sm btn--pill">로그인</Link>
        </div>
      </header>

      <main className="container">
        <p className="today-line">
          오늘 <b>{formatToday()}</b>
        </p>

        <div className="guest-cta">
          <div>
            <strong>로그인하고 시작하세요</strong>
            <span>할 일을 추가하려면 로그인이 필요해요. 계정을 만들면 어디서든 이어서 관리할 수 있어요.</span>
          </div>
          <Link to="/login" className="btn btn--primary btn--pill">로그인</Link>
        </div>

        <div className="stat-grid" aria-hidden="true">
          {STATS.map((s) => (
            <div key={s.label} className={`stat-card ${s.mod ?? ''}`}>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="filter-bar" aria-hidden="true">
          <div className="filter-bar__group">
            <div className="seg">
              {STATUS_TABS.map((t, i) => (
                <span key={t} className={`seg__btn${i === 0 ? ' is-active' : ''}`}>{t}</span>
              ))}
            </div>
            <span className="pill-input pill-input--ghost">제목·내용 검색</span>
          </div>
          <span className="btn btn--primary btn--pill">
            <PlusIcon width={14} height={14} /> 새 할 일
          </span>
        </div>

        <Link to="/login" className="quick-add quick-add--guest">
          <PlusIcon className="quick-add__icon" width={15} height={15} />
          <span className="quick-add__input">빠른 추가 — 로그인 후 이용할 수 있어요</span>
        </Link>

        <div className="state">
          <span className="state__icon"><InboxIcon /></span>
          아직 할 일이 없어요. 로그인하고 첫 할 일을 추가해 보세요.
        </div>
      </main>
    </div>
  )
}
