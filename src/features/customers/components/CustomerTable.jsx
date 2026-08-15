import { useNavigate } from 'react-router-dom'
import { Table } from '../../../components/Table/Table'
import { Badge } from '../../../components/Badge/Badge'
import { Dropdown, DropdownItem } from '../../../components/Dropdown/Dropdown'
import { PermissionGate } from '../../roles/PermissionGate'
import { formatDate } from '../../../utils/formatDate'
import { MoreIcon } from '../../../components/icons/Icons'
import { CUSTOMER_STATUS_LABELS } from '../customers.constants'

export function CustomerTable({ customers, onDeactivate }) {
  const navigate = useNavigate()

  const columns = [
    { key: 'name', header: 'Ism', render: (row) => <span className="table__cell-primary">{row.name}</span> },
    { key: 'phone', header: 'Telefon', render: (row) => row.phone || '—' },
    { key: 'business', header: 'Biznes', render: (row) => row.business?.name || '—' },
    {
      key: 'programs',
      header: 'Dasturlar',
      render: (row) =>
        (row.programs || []).length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {row.programs.map((p) => (
              <Badge key={p.id} variant="gray">
                {p.name}
              </Badge>
            ))}
          </div>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      header: 'Holat',
      render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'gray'}>{CUSTOMER_STATUS_LABELS[row.status] || row.status}</Badge>,
    },
    { key: 'assignedEmployee', header: 'Mas’ul xodim', render: (row) => row.assignedEmployee?.name || '—' },
    { key: 'lastContactAt', header: 'Oxirgi aloqa', render: (row) => (row.lastContactAt ? formatDate(row.lastContactAt) : '—') },
    {
      key: 'actions',
      header: '',
      width: 56,
      render: (row) => (
        <div className="table__actions" onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={(toggle) => (
              <button type="button" className="header__icon-btn" onClick={toggle} aria-label="Amallar">
                <MoreIcon width={16} height={16} />
              </button>
            )}
          >
            <DropdownItem onClick={() => navigate(`/admin/crm/customers/${row.id}`)}>Ko‘rish</DropdownItem>
            <PermissionGate permission="customers.edit">
              <DropdownItem onClick={() => navigate(`/admin/crm/customers/${row.id}?edit=1`)}>Tahrirlash</DropdownItem>
            </PermissionGate>
            <PermissionGate permission="customers.delete">
              <DropdownItem danger onClick={() => onDeactivate(row)}>
                {row.status === 'active' ? 'Faolsizlantirish' : 'Faollashtirish'}
              </DropdownItem>
            </PermissionGate>
          </Dropdown>
        </div>
      ),
    },
  ]

  return <Table columns={columns} data={customers} onRowClick={(row) => navigate(`/admin/crm/customers/${row.id}`)} />
}
