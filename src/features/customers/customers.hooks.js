import { useCallback, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { customersService } from '../../services/customers.service'

const VIEW_STORAGE_KEY = 'bold-yechim-customers-view'

function loadStoredView() {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'card' ? 'card' : 'list'
  } catch {
    return 'list'
  }
}

export function useCustomers() {
  const [view, setViewState] = useState(loadStoredView)
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    assignedEmployeeId: '',
    city: '',
    program: '',
    groupId: '',
    installationStatus: '',
    createdFrom: '',
    createdTo: '',
    sort: '-createdAt',
  })

  const { data, loading, error, refetch } = useAsync(
    () => customersService.list(params),
    [
      params.page, params.pageSize, params.search, params.status, params.assignedEmployeeId,
      params.city, params.program, params.groupId, params.installationStatus,
      params.createdFrom, params.createdTo, params.sort,
    ]
  )

  const setView = useCallback((next) => {
    setViewState(next)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next)
    } catch {
      // Storage unavailable — the choice just won't persist across reloads.
    }
  }, [])

  const setSearch = useCallback((search) => setParams((p) => ({ ...p, search, page: 1 })), [])
  const setStatus = useCallback((status) => setParams((p) => ({ ...p, status, page: 1 })), [])
  const setAssignedEmployeeId = useCallback((assignedEmployeeId) => setParams((p) => ({ ...p, assignedEmployeeId, page: 1 })), [])
  const setCity = useCallback((city) => setParams((p) => ({ ...p, city, page: 1 })), [])
  const setProgram = useCallback((program) => setParams((p) => ({ ...p, program, page: 1 })), [])
  const setGroupId = useCallback((groupId) => setParams((p) => ({ ...p, groupId, page: 1 })), [])
  const setInstallationStatus = useCallback((installationStatus) => setParams((p) => ({ ...p, installationStatus, page: 1 })), [])
  const setCreatedFrom = useCallback((createdFrom) => setParams((p) => ({ ...p, createdFrom, page: 1 })), [])
  const setCreatedTo = useCallback((createdTo) => setParams((p) => ({ ...p, createdTo, page: 1 })), [])
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
    setGroupId,
    setInstallationStatus,
    setCreatedFrom,
    setCreatedTo,
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
