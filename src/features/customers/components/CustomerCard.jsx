import { useNavigate } from 'react-router-dom'
import { Badge } from '../../../components/Badge/Badge'
import { CUSTOMER_STATUS_LABELS } from '../customers.constants'
import './CustomerCard.scss'

export function CustomerCard({ customer }) {
  const navigate = useNavigate()
  const programs = customer.programs || []

  return (
    <div className="customer-card" onClick={() => navigate(`/admin/crm/customers/${customer.id}`)}>
      <div className="customer-card__header">
        <span className="customer-card__name">{customer.name}</span>
        <Badge variant={customer.status === 'active' ? 'success' : 'gray'}>
          {CUSTOMER_STATUS_LABELS[customer.status] || customer.status}
        </Badge>
      </div>
      <div className="customer-card__phone">{customer.phone || '—'}</div>
      {customer.business?.name && <div className="customer-card__business">{customer.business.name}</div>}
      {programs.length > 0 && (
        <div className="customer-card__programs">
          {programs.map((program) => (
            <span key={program} className="customer-card__program-tag">
              {program}
            </span>
          ))}
        </div>
      )}
      <div className="customer-card__footer">
        <span>{customer.assignedEmployee?.name || '—'}</span>
      </div>
    </div>
  )
}
