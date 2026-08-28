import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoIcon } from '../components/icons'
import { toMessage } from '../api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(toMessage(err, '로그인에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={submit}>
        <div className="auth__brand">
          <span className="brand-mark"><LogoIcon /></span>
          Todolist
        </div>
        <h1 className="auth__title">다시 오신 걸 환영해요</h1>
        <p className="auth__sub">계정으로 로그인하고 할 일을 이어서 관리하세요.</p>

        <label className="field">
          <span>아이디</span>
          <input name="username" value={form.username} onChange={change} required autoFocus />
        </label>
        <label className="field">
          <span>비밀번호</span>
          <input type="password" name="password" value={form.password} onChange={change} required />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? '로그인 중…' : '로그인'}
        </button>

        <p className="auth__switch">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </div>
  )
}
