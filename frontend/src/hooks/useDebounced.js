import { useEffect, useState } from 'react'

// value 가 delay(ms) 동안 안정되면 그 값을 반환한다. (검색어 입력 등)
export default function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
