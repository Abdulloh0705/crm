import { useCallback, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { customersService } from '../../services/customers.service'

export function useCustomers() {
  const [params, setParams] = useState({ page: 1, pageSize: 10, search: '', status: '', sort: '-createdAt' })

  const { data, loading, error, refetch } = useAsync(
    () => customersService.list(params),
    [params.page, params.pageSize, params.search, params.status, params.sort]
  )

  const setSearch = useCallback((search) => setParams((p) => ({ ...p, search, page: 1 })), [])
  const setStatus = useCallback((status) => setParams((p) => ({ ...p, status, page: 1 })), [])
  const setSort = useCallback((sort) => setParams((p) => ({ ...p, sort, page: 1 })), [])
  const setPage = useCallback((page) => setParams((p) => ({ ...p, page })), [])

  return {
    customers: data?.items ?? [],
    total: data?.total ?? 0,
    params,
    setSearch,
    setStatus,
    setSort,
    setPage,
    loading,
    error,
    refetch,
  }
}

export function useCustomer(id) {
  return useAsync(() => customersService.get(id), [id])
}
