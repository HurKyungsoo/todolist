import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoIcon } from './icons'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <span className="navbar__brand">
        <span className="brand-mark"><LogoIcon /></span>
        Todolist
      </span>
      <div className="navbar__right">
        <span className="navbar__user">{user?.username}</span>
        <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  )
}
