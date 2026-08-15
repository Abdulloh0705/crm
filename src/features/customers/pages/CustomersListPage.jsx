import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomers } from '../customers.hooks'
import { customersService } from '../../../services/customers.service'
import { businessesService } from '../../../services/businesses.service'
import { employeesService } from '../../../services/employees.service'
import { CustomerTable } from '../components/CustomerTable'
import { CustomerCard } from '../components/CustomerCard'
import { CustomerForm } from '../components/CustomerForm'
import { CustomerGroupsBar } from '../components/CustomerGroupsBar'
import { CustomerWorkspace } from '../components/CustomerWorkspace'
import { CUSTOMER_STATUSES, CUSTOMER_STATUS_LABELS } from '../customers.constants'
import { INSTALLATION_STATUSES, INSTALLATION_STATUS_LABELS } from '../../installations/installations.constants'
import { Button } from '../../../components/Button/Button'
import { Input } from '../../../components/Input/Input'
import { Select } from '../../../components/Select/Select'
import { Drawer } from '../../../components/Drawer/Drawer'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Alert } from '../../../components/Alert/Alert'
import { Spinner } from '../../../components/Spinner/Spinner'
import { Pagination } from '../../../components/Pagination/Pagination'
import { PermissionGate } from '../../roles/PermissionGate'
import { useConfirm } from '../../../store/ConfirmContext'
import { useToast } from '../../../store/ToastContext'
import { useAction } from '../../../hooks/useAction'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { InboxIcon, PlusIcon, SearchIcon } from '../../../components/icons/Icons'
import { classNames } from '../../../utils/classNames'

export function CustomersListPage() {
  const { id: openCustomerId } = useParams()
  const navigate = useNavigate()
  const {
    view,
    setView,
    customers,
    total,
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
  } = useCustomers()
  const { isOpen, open, close } = useDisclosure()
  const [employees, setEmployees] = useState([])
  const [filterOptions, setFilterOptions] = useState({ cities: [], programs: [] })
  const confirm = useConfirm()
  const toast = useToast()

  const createAction = useAction(async (customerPayload, businessPayload) => {
    const customer = await customersService.create(customerPayload)
    if (businessPayload) {
      await businessesService.create({ ...businessPayload, customerId: customer.id })
    }
    return customer
  })
  const deactivateAction = useAction((customer) => customersService.deactivate(customer.id))

  useEffect(() => {
    employeesService
      .list({ pageSize: 100 })
      .then((res) => setEmployees((res?.items ?? []).filter((e) => e.status === 'active')))
      .catch(() => setEmployees([]))
    customersService
      .getFilterOptions()
      .then((res) => setFilterOptions({ cities: res?.cities ?? [], programs: res?.programs ?? [] }))
      .catch(() => setFilterOptions({ cities: [], programs: [] }))
  }, [])

  const handleCreate = async (customerPayload, businessPayload) => {
    try {
      await createAction.run(customerPayload, businessPayload)
      toast.success('Mijoz qo‘shildi')
      close()
      refetch()
    } catch (err) {
      toast.error(err.message || 'Mijoz qo‘shishda xatolik yuz berdi')
    }
  }

  const openWorkspace = (customerId) => navigate(`/admin/crm/customers/${customerId}`)
  const closeWorkspace = () => navigate('/admin/crm/customers')

  const handleDeactivate = async (customer) => {
    const activating = customer.status !== 'active'
    const ok = await confirm({
      title: activating ? 'Mijozni faollashtirish' : 'Mijozni faolsizlantirish',
      description: `${customer.name} ${activating ? 'faollashtirilsinmi' : 'faolsizlantirilsinmi'}?`,
      confirmLabel: activating ? 'Faollashtirish' : 'Faolsizlantirish',
      danger: !activating,
    })
    if (!ok) return
    try {
      await deactivateAction.run(customer)
      toast.success('Holat yangilandi')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Holatni yangilashda xatolik yuz berdi')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Mijozlar</h2>
          <p className="page-header__subtitle">Mijozlar ro‘yxati</p>
        </div>
        <div className="page-header__actions">
          <div className="view-toggle">
            <button type="button" className={classNames('view-toggle__btn', view === 'card' && 'view-toggle__btn--active')} onClick={() => setView('card')}>
              Card
            </button>
            <button type="button" className={classNames('view-toggle__btn', view === 'list' && 'view-toggle__btn--active')} onClick={() => setView('list')}>
              Ro‘yxat
            </button>
          </div>
          <PermissionGate permission="customers.create">
            <Button onClick={open}>
              <PlusIcon width={16} height={16} /> Mijoz qo‘shish
            </Button>
          </PermissionGate>
        </div>
      </div>

      <CustomerGroupsBar activeGroupId={params.groupId} onSelectGroup={setGroupId} />

      <div className="filters-row">
        <div className="input-group filters-row__search">
          <span className="input-group__icon">
            <SearchIcon width={16} height={16} />
          </span>
          <Input
            placeholder="Ism, telefon, email, biznes, shahar yoki dastur"
            value={params.search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={params.status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 150 }}>
          <option value="">Barcha holatlar</option>
          {CUSTOMER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CUSTOMER_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Select value={params.assignedEmployeeId} onChange={(e) => setAssignedEmployeeId(e.target.value)} style={{ maxWidth: 170 }}>
          <option value="">Barcha xodimlar</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </Select>
        <Select value={params.city} onChange={(e) => setCity(e.target.value)} style={{ maxWidth: 150 }}>
          <option value="">Barcha shaharlar</option>
          {filterOptions.cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
        <Select value={params.program} onChange={(e) => setProgram(e.target.value)} style={{ maxWidth: 170 }}>
          <option value="">Barcha dasturlar</option>
          {filterOptions.programs.map((program) => (
            <option key={program} value={program}>
              {program}
            </option>
          ))}
        </Select>
        <Select value={params.installationStatus} onChange={(e) => setInstallationStatus(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Barcha o‘rnatish holatlari</option>
          {INSTALLATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {INSTALLATION_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Input type="date" value={params.createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} style={{ maxWidth: 150 }} title="Sanadan" />
        <Input type="date" value={params.createdTo} onChange={(e) => setCreatedTo(e.target.value)} style={{ maxWidth: 150 }} title="Sanagacha" />
        <Select value={params.sort} onChange={(e) => setSort(e.target.value)} style={{ maxWidth: 170 }}>
          <option value="-createdAt">Yangi qo‘shilgan</option>
          <option value="createdAt">Eski qo‘shilgan</option>
          <option value="name">Ism (A-Z)</option>
          <option value="-name">Ism (Z-A)</option>
        </Select>
      </div>

      {error && (
        <Alert variant="danger" title="Mijozlarni yuklab bo‘lmadi">
          {error.message}
        </Alert>
      )}

      {loading && !error && (
        <div className="page-loading">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <EmptyState icon={<InboxIcon width={22} height={22} />} title="Mijozlar topilmadi" description="Hozircha mijozlar ro‘yxati bo‘sh." />
      )}

      {!loading && !error && customers.length > 0 && view === 'list' && (
        <>
          <CustomerTable customers={customers} onDeactivate={handleDeactivate} onOpen={openWorkspace} />
          <Pagination page={params.page} pageSize={params.pageSize} total={total} onPageChange={setPage} />
        </>
      )}

      {!loading && !error && customers.length > 0 && view === 'card' && (
        <>
          <div className="customer-card-grid">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} onOpen={openWorkspace} />
            ))}
          </div>
          <Pagination page={params.page} pageSize={params.pageSize} total={total} onPageChange={setPage} />
        </>
      )}

      <Drawer open={isOpen} title="Mijoz qo‘shish" subtitle="Asosiy ma'lumotlarni kiriting, qolganini keyinroq to‘ldirishingiz mumkin." onClose={close}>
        <CustomerForm employees={employees} submitLabel="Qo‘shish" loading={createAction.loading} onSubmit={handleCreate} onCancel={close} />
      </Drawer>

      <Drawer open={!!openCustomerId} size="xl" noBodyPadding onClose={closeWorkspace}>
        {openCustomerId && <CustomerWorkspace key={openCustomerId} customerId={openCustomerId} />}
      </Drawer>
    </div>
  )
}
