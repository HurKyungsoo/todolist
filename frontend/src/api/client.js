import axios from 'axios'

const TOKEN_KEY = 'todolist.token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

// 요청마다 JWT 자동 첨부
client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 → 토큰 만료/무효. 토큰 제거 후 로그인 페이지로.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      setToken(null)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

// 서버가 내려주는 에러 메시지({ message, errors })를 사람이 읽을 문자열로
export function toMessage(error, fallback = '요청을 처리하지 못했습니다.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).join('\n')
  }
  return data.message || fallback
}

export default client
