import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../../components/Avatar/Avatar'
import { Badge } from '../../../components/Badge/Badge'
import { CUSTOMER_STATUS_LABELS } from '../customers.constants'
import './CustomerCard.scss'

export function CustomerCard({ customer }) {
  const navigate = useNavigate()
  const programs = customer.programs || []

  return (
    <div className="customer-card" onClick={() => navigate(`/admin/crm/customers/${customer.id}`)}>
      <div className="customer-card__top">
        <Avatar name={customer.name} size="lg" />
        <div className="customer-card__identity">
          <span className="customer-card__name">{customer.name}</span>
          <span className="customer-card__phone">{customer.phone || '—'}</span>
        </div>
      </div>

      {programs.length > 0 && (
        <div className="customer-card__programs">
          {programs.map((program) => (
            <span key={program.id} className="customer-card__program-tag">
              {program.name}
            </span>
          ))}
        </div>
      )}

      {customer.business?.name && <div className="customer-card__business">{customer.business.name}</div>}

      <div className="customer-card__footer">
        <span className="customer-card__assignee">Mas'ul: {customer.assignedEmployee?.name || '—'}</span>
        <Badge variant={customer.status === 'active' ? 'success' : 'gray'}>
          {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
        </Badge>
      </div>
    </div>
  )
}
