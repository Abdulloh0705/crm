import { Table } from '../../../components/Table/Table'
import { TaskPriorityBadge, TaskStatusBadge } from './TaskBadges'
import { formatDate } from '../../../utils/formatDate'

function relatedLabel(row) {
  if (row.deal?.name) return `Savdo: ${row.deal.name}`
  if (row.lead?.title) return `Murojaat: ${row.lead.title}`
  if (row.business?.name) return `Biznes: ${row.business.name}`
  if (row.customer?.name) return `Mijoz: ${row.customer.name}`
  return '—'
}

export function TaskTable({ tasks }) {
  const columns = [
    { key: 'title', header: 'Sarlavha', render: (row) => <span className="table__cell-primary">{row.title}</span> },
    { key: 'assignedEmployee', header: 'Mas’ul xodim', render: (row) => row.assignedEmployee?.name || '—' },
    { key: 'related', header: 'Bog‘liq', render: relatedLabel },
    { key: 'dueDate', header: 'Muddat', render: (row) => formatDate(row.dueDate) },
    { key: 'priority', header: 'Muhimlik', render: (row) => <TaskPriorityBadge priority={row.priority} /> },
    { key: 'status', header: 'Holat', render: (row) => <TaskStatusBadge status={row.status} /> },
  ]

  return <Table columns={columns} data={tasks} />
}
