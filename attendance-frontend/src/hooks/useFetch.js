import { useState, useEffect, useCallback } from 'react'

/**
 * Generic hook for async data fetching.
 * @param {Function} fetchFn - async function that returns data
 * @param {Array} deps - dependency array (like useEffect)
 * @param {boolean} immediate - whether to fetch on mount (default: true)
 */
export function useFetch(fetchFn, deps = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  }, [execute, immediate])

  return { data, loading, error, refetch: execute }
}

/**
 * Hook to debounce a value (useful for search inputs).
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
