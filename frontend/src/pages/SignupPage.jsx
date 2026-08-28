import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toMessage } from '../api/client'

export default function SignupPage() {
  const { signup, login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signup(form)
      // 가입 성공 시 바로 로그인시켜 목록으로 이동
      await login({ username: form.username, password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(toMessage(err, '회원가입에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={submit}>
        <h1 className="auth__title">회원가입</h1>

        <label className="field">
          <span>아이디</span>
          <input name="username" value={form.username} onChange={change} required autoFocus minLength={3} maxLength={50} />
        </label>
        <label className="field">
          <span>비밀번호</span>
          <input type="password" name="password" value={form.password} onChange={change} required minLength={4} />
        </label>
        <label className="field">
          <span>이메일</span>
          <input type="email" name="email" value={form.email} onChange={change} required />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? '가입 중…' : '회원가입'}
        </button>

        <p className="auth__switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  )
}
