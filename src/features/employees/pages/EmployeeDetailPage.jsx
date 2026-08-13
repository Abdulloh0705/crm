import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEmployee } from '../employees.hooks'
import { employeesService } from '../../../services/employees.service'
import { analyticsService } from '../../../services/analytics.service'
import { EmployeeForm } from '../components/EmployeeForm'
import { EmployeeStatusBadge } from '../components/EmployeeStatusBadge'
import { Card } from '../../../components/Card/Card'
import { Avatar } from '../../../components/Avatar/Avatar'
import { Button } from '../../../components/Button/Button'
import { Alert } from '../../../components/Alert/Alert'
import { Spinner } from '../../../components/Spinner/Spinner'
import { RelatedList } from '../../../components/RelatedList/RelatedList'
import { StatCard } from '../../../components/charts/StatCard'
import { PermissionGate } from '../../roles/PermissionGate'
import { useAsync } from '../../../hooks/useAsync'
import { useAction } from '../../../hooks/useAction'
import { useToast } from '../../../store/ToastContext'
import { formatDate } from '../../../utils/formatDate'
import { ROLE_LABELS } from '../../roles/permissions'
import { InboxIcon, BuildingIcon, DashboardIcon, TeamIcon, UsersIcon } from '../../../components/icons/Icons'
import './EmployeeDetailPage.scss'

function PerformanceSection({ employeeId }) {
  const { data, loading, error } = useAsync(() => analyticsService.getEmployeePerformance(employeeId), [employeeId])

  if (error) {
    return (
      <Card title="Samaradorlik">
        <p className="text-muted text-xs">Statistikani yuklab bo‘lmadi: {error.message}</p>
      </Card>
    )
  }

  const s = data || {}

  return (
    <Card title="Samaradorlik">
      <div className="stat-card-grid">
        <StatCard label="Murojaatlar" value={s.leads} icon={<InboxIcon width={18} height={18} />} loading={loading} />
        <StatCard label="Savdolar" value={s.deals} icon={<BuildingIcon width={18} height={18} />} variant="info" loading={loading} />
        <StatCard label="Yutilgan savdolar" value={s.wonDeals} icon={<DashboardIcon width={18} height={18} />} variant="success" loading={loading} />
        <StatCard label="Tushum" value={s.revenue} icon={<DashboardIcon width={18} height={18} />} variant="success" loading={loading} />
        <StatCard label="Bajarilgan vazifalar" value={s.tasksCompleted} icon={<UsersIcon width={18} height={18} />} loading={loading} />
        <StatCard label="Yakunlangan o‘rnatishlar" value={s.installationsCompleted} icon={<TeamIcon width={18} height={18} />} loading={loading} />
      </div>
    </Card>
  )
}

export function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isEditing = searchParams.get('edit') === '1'
  const toast = useToast()

  const { data: employee, loading, error, refetch } = useEmployee(id)
  const updateAction = useAction((values) => employeesService.update(id, values))
  const [teams] = useState([])

  const handleUpdate = async (values) => {
    try {
      await updateAction.run(values)
      toast.success('Ma’lumotlar yangilandi')
      setSearchParams({})
      refetch()
    } catch (err) {
      toast.error(err.message || 'Yangilashda xatolik yuz berdi')
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <Alert variant="danger" title="Xodim topilmadi">
        {error?.message || 'Bu xodim mavjud emas yoki o‘chirilgan.'}
      </Alert>
    )
  }

  return (
    <div className="stack">
      <div className="employee-profile-header">
        <Avatar name={employee.name} src={employee.avatarUrl} size="xl" />
        <div className="employee-profile-header__meta">
          <div className="employee-profile-header__name">{employee.name}</div>
          <div className="employee-profile-header__sub">
            <span>{ROLE_LABELS[employee.role] || employee.role}</span>
            <EmployeeStatusBadge status={employee.status} />
          </div>
        </div>
        <div className="employee-profile-header__actions">
          <Button variant="secondary" onClick={() => navigate('/admin/employees')}>
            Ortga
          </Button>
          <PermissionGate permission="employees.edit">
            <Button onClick={() => setSearchParams({ edit: '1' })}>Tahrirlash</Button>
          </PermissionGate>
        </div>
      </div>

      {isEditing ? (
        <Card title="Ma'lumotlarni tahrirlash">
          <EmployeeForm
            initialValues={employee}
            teams={teams}
            submitLabel="Saqlash"
            loading={updateAction.loading}
            onSubmit={handleUpdate}
            onCancel={() => setSearchParams({})}
          />
        </Card>
      ) : (
        <Card title="Shaxsiy ma'lumotlar">
          <div className="detail-grid">
            <div className="detail-field">
              <div className="detail-field__label">Elektron pochta</div>
              <div className="detail-field__value">{employee.email}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field__label">Telefon</div>
              <div className="detail-field__value">{employee.phone || '—'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field__label">Jamoa</div>
              <div className="detail-field__value">{employee.team?.name || '—'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field__label">Qo‘shilgan sana</div>
              <div className="detail-field__value">{formatDate(employee.createdAt)}</div>
            </div>
          </div>
        </Card>
      )}

      <PerformanceSection employeeId={id} />

      <div className="detail-grid">
        <RelatedList
          title="Biriktirilgan lidlar"
          fetcher={() => employeesService.getAssignedLeads(id)}
          deps={[id]}
          linkTo={(item) => `/admin/crm/leads/${item.id}`}
          renderItem={(item) => <span>{item.title}</span>}
          emptyHint="Bu xodimga hali lead biriktirilmagan."
        />
        <RelatedList
          title="Biriktirilgan bitimlar"
          fetcher={() => employeesService.getAssignedDeals(id)}
          deps={[id]}
          linkTo={(item) => `/admin/crm/deals/${item.id}`}
          renderItem={(item) => <span>{item.name}</span>}
          emptyHint="Bu xodimga hali deal biriktirilmagan."
        />
        <RelatedList
          title="Biriktirilgan o‘rnatishlar"
          fetcher={() => employeesService.getAssignedInstallations(id)}
          deps={[id]}
          linkTo={(item) => `/admin/crm/installations/${item.id}`}
          renderItem={(item) => <span>{item.status}</span>}
          emptyHint="Bu xodimga hali o‘rnatish biriktirilmagan."
        />
        <RelatedList
          title="Biriktirilgan vazifalar"
          fetcher={() => employeesService.getAssignedTasks(id)}
          deps={[id]}
          renderItem={(item) => <span>{item.title}</span>}
          emptyHint="Bu xodimga hali vazifa biriktirilmagan."
        />
      </div>
    </div>
  )
}
