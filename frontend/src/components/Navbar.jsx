import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <span className="navbar__brand">✅ Todolist</span>
      <div className="navbar__right">
        <span className="navbar__user">{user?.username} 님</span>
        <button className="btn btn--ghost" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  )
}
