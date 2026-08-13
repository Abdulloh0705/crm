import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useCustomer } from '../customers.hooks'
import { customersService } from '../../../services/customers.service'
import { CustomerForm } from '../components/CustomerForm'
import { CUSTOMER_STATUS_LABELS } from '../customers.constants'
import { Card } from '../../../components/Card/Card'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Alert } from '../../../components/Alert/Alert'
import { Spinner } from '../../../components/Spinner/Spinner'
import { RelatedList } from '../../../components/RelatedList/RelatedList'
import { Tabs } from '../../../components/Tabs/Tabs'
import { PermissionGate } from '../../roles/PermissionGate'
import { ActivitiesSection } from '../../activities/ActivitiesSection'
import { CommentsSection } from '../../comments/CommentsSection'
import { AttachmentsSection } from '../../attachments/AttachmentsSection'
import { HistorySection } from '../../timeline/HistorySection'
import { ScheduleFollowUpButton } from '../../tasks/components/ScheduleFollowUpButton'
import { useAction } from '../../../hooks/useAction'
import { useToast } from '../../../store/ToastContext'
import { formatDate } from '../../../utils/formatDate'

const TABS = [
  { id: 'overview', label: 'Umumiy' },
  { id: 'business', label: 'Biznes' },
  { id: 'leads', label: 'Murojaatlar' },
  { id: 'deals', label: 'Savdolar' },
  { id: 'payments', label: 'To‘lovlar' },
  { id: 'activities', label: 'Faoliyatlar' },
  { id: 'tasks', label: 'Vazifalar' },
  { id: 'installations', label: 'O‘rnatishlar' },
  { id: 'comments', label: 'Izohlar' },
  { id: 'attachments', label: 'Fayllar' },
]

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isEditing = searchParams.get('edit') === '1'
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: customer, loading, error, refetch } = useCustomer(id)
  const updateAction = useAction((values) => customersService.update(id, values))
  const [employees] = useState([])

  const handleUpdate = async (values) => {
    try {
      await updateAction.run(values)
      toast.success('Mijoz ma’lumotlari yangilandi')
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

  if (error || !customer) {
    return (
      <Alert variant="danger" title="Mijoz topilmadi">
        {error?.message || 'Bu mijoz mavjud emas yoki o‘chirilgan.'}
      </Alert>
    )
  }

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{customer.name}</h2>
          <p className="page-header__subtitle">
            <Badge variant={customer.status === 'active' ? 'success' : 'gray'}>
              {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
            </Badge>
          </p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" onClick={() => navigate('/admin/crm/customers')}>
            Ortga
          </Button>
          <ScheduleFollowUpButton entityName={customer.name} context={{ customerId: id }} />
          <PermissionGate permission="customers.edit">
            <Button onClick={() => setSearchParams({ edit: '1' })}>Tahrirlash</Button>
          </PermissionGate>
        </div>
      </div>

      {isEditing ? (
        <Card title="Ma'lumotlarni tahrirlash">
          <CustomerForm
            initialValues={customer}
            employees={employees}
            submitLabel="Saqlash"
            loading={updateAction.loading}
            onSubmit={handleUpdate}
            onCancel={() => setSearchParams({})}
          />
        </Card>
      ) : (
        <>
          <Tabs items={TABS} activeId={activeTab} onChange={setActiveTab} />

          {activeTab === 'overview' && (
            <Card title="Umumiy ma'lumot">
              <div className="detail-grid">
                <div className="detail-field">
                  <div className="detail-field__label">Telefon</div>
                  <div className="detail-field__value">{customer.phone || '—'}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field__label">Elektron pochta</div>
                  <div className="detail-field__value">{customer.email || '—'}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field__label">Mas'ul xodim</div>
                  <div className="detail-field__value">{customer.assignedEmployee?.name || '—'}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field__label">Qo‘shilgan sana</div>
                  <div className="detail-field__value">{formatDate(customer.createdAt)}</div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'business' && (
            <RelatedList
              title="Bizneslar"
              fetcher={() => customersService.getBusinesses(id)}
              deps={[id]}
              linkTo={(item) => `/admin/crm/businesses/${item.id}`}
              renderItem={(item) => <span>{item.name}</span>}
              emptyHint="Bu mijozga hali biznes biriktirilmagan."
              action={
                <PermissionGate permission="businesses.create">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/crm/businesses?customerId=${id}`)}>
                    + Qo‘shish
                  </Button>
                </PermissionGate>
              }
            />
          )}

          {activeTab === 'leads' && (
            <RelatedList
              title="Murojaatlar"
              fetcher={() => customersService.getLeads(id)}
              deps={[id]}
              linkTo={(item) => `/admin/crm/leads/${item.id}`}
              renderItem={(item) => <span>{item.title}</span>}
              emptyHint="Bu mijoz uchun hali murojaat yaratilmagan."
            />
          )}

          {activeTab === 'deals' && (
            <RelatedList
              title="Savdolar"
              fetcher={() => customersService.getDeals(id)}
              deps={[id]}
              linkTo={(item) => `/admin/crm/deals/${item.id}`}
              renderItem={(item) => <span>{item.name}</span>}
              emptyHint="Bu mijoz uchun hali savdo yaratilmagan."
            />
          )}

          {activeTab === 'payments' && (
            <RelatedList
              title="To‘lovlar"
              fetcher={() => customersService.getPayments(id)}
              deps={[id]}
              renderItem={(item) => <span>{item.amount} — {item.status}</span>}
              emptyHint="Bu mijoz uchun hali to‘lov qayd etilmagan."
            />
          )}

          {activeTab === 'activities' && (
            <div className="stack">
              <ActivitiesSection fetcher={() => customersService.getActivities(id)} deps={[id]} context={{ customerId: id }} />
              <HistorySection entityType="customer" entityId={id} title="Mijoz tarixi" />
            </div>
          )}

          {activeTab === 'tasks' && (
            <RelatedList
              title="Vazifalar"
              fetcher={() => customersService.getTasks(id)}
              deps={[id]}
              renderItem={(item) => <span>{item.title}</span>}
              emptyHint="Bu mijoz bilan bog‘liq vazifa yo‘q."
            />
          )}

          {activeTab === 'installations' && (
            <RelatedList
              title="O‘rnatishlar"
              fetcher={() => customersService.getInstallations(id)}
              deps={[id]}
              linkTo={(item) => `/admin/crm/installations/${item.id}`}
              renderItem={(item) => <span>{item.status}</span>}
              emptyHint="Bu mijoz uchun hali o‘rnatish rejalashtirilmagan."
            />
          )}

          {activeTab === 'comments' && <CommentsSection entityType="customer" entityId={id} />}

          {activeTab === 'attachments' && <AttachmentsSection entityType="customer" entityId={id} />}
        </>
      )}
    </div>
  )
}
