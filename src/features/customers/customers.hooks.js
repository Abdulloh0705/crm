import { useCallback, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { customersService } from '../../services/customers.service'

export function useCustomers() {
  const [view, setView] = useState('list')
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    assignedEmployeeId: '',
    city: '',
    program: '',
    sort: '-createdAt',
  })

  const { data, loading, error, refetch } = useAsync(
    () => customersService.list(params),
    [params.page, params.pageSize, params.search, params.status, params.assignedEmployeeId, params.city, params.program, params.sort]
  )

  const setSearch = useCallback((search) => setParams((p) => ({ ...p, search, page: 1 })), [])
  const setStatus = useCallback((status) => setParams((p) => ({ ...p, status, page: 1 })), [])
  const setAssignedEmployeeId = useCallback((assignedEmployeeId) => setParams((p) => ({ ...p, assignedEmployeeId, page: 1 })), [])
  const setCity = useCallback((city) => setParams((p) => ({ ...p, city, page: 1 })), [])
  const setProgram = useCallback((program) => setParams((p) => ({ ...p, program, page: 1 })), [])
  const setSort = useCallback((sort) => setParams((p) => ({ ...p, sort, page: 1 })), [])
  const setPage = useCallback((page) => setParams((p) => ({ ...p, page })), [])

  return {
    view,
    setView,
    customers: data?.items ?? [],
    total: data?.total ?? 0,
    params,
    setSearch,
    setStatus,
    setAssignedEmployeeId,
    setCity,
    setProgram,
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
