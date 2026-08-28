import client from './client'

// 회원가입: { username, password, email } → 201 { id, username, email }
export function signup(payload) {
  return client.post('/users/signup', payload).then((r) => r.data)
}

// 로그인: { username, password } → { token, tokenType, userId, username }
export function login(payload) {
  return client.post('/users/login', payload).then((r) => r.data)
}
