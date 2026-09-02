import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import GuestHome from './pages/GuestHome'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import TodosPage from './pages/TodosPage'

// 루트('/'): 로그인 상태면 할 일 목록, 아니면 게스트 화면(빈 상태 + 로그인 유도)
function Home() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <TodosPage /> : <GuestHome />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
