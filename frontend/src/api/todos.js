import client from './client'

// 목록 (페이지네이션 + 선택 필터). 스프링 Page 객체를 그대로 반환.
// params: { page, size, sort, category, completed }
export function fetchTodos({ page = 0, size = 10, sort = 'dueDate', category, completed } = {}) {
  const params = { page, size, sort }
  if (category) params.category = category
  if (completed !== undefined && completed !== null && completed !== '') {
    params.completed = completed
  }
  return client.get('/todos', { params }).then((r) => r.data)
}

export function getTodo(id) {
  return client.get(`/todos/${id}`).then((r) => r.data)
}

// payload: { title, content, dueDate, category }  (dueDate: 'yyyy-MM-ddTHH:mm:ss' | null)
export function createTodo(payload) {
  return client.post('/todos', payload).then((r) => r.data)
}

export function updateTodo(id, payload) {
  return client.put(`/todos/${id}`, payload).then((r) => r.data)
}

// 완료 여부 토글
export function toggleComplete(id) {
  return client.patch(`/todos/${id}/complete`).then((r) => r.data)
}

export function deleteTodo(id) {
  return client.delete(`/todos/${id}`)
}
