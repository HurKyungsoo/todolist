import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoIcon } from './icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true }) // 로그아웃 후 게스트 첫 화면으로
  }

  return (
    <header className="navbar">
      <span className="navbar__brand">
        <span className="brand-mark"><LogoIcon /></span>
        Todolist
      </span>
      <div className="navbar__right">
        <span className="navbar__user">
          <span className="navbar__avatar" aria-hidden="true">
            {(user?.username ?? '?').slice(0, 1).toUpperCase()}
          </span>
          {user?.username}
        </span>
        <button className="btn btn--soft btn--sm btn--pill" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  )
}
