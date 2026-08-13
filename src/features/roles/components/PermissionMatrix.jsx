import { PERMISSION_SCHEMA } from '../permissions'
import './PermissionMatrix.scss'

const ACTION_LABELS = { view: 'Ko‘rish', create: 'Yaratish', edit: 'Tahrirlash', delete: 'O‘chirish', viewAll: 'Barchasini ko‘rish' }

// Columns are derived from whatever actions the schema actually declares
// (in a stable, sensible order) instead of a fixed 4-action list, so
// resource-specific extras like `tasks.viewAll` still get a column.
const ACTION_ORDER = ['view', 'viewAll', 'create', 'edit', 'delete']
const ALL_ACTIONS = ACTION_ORDER.filter((action) =>
  PERMISSION_SCHEMA.some((resource) => resource.actions.includes(action))
)

/**
 * Renders resource x action checkboxes for a role. `value` is the role's
 * current permission array (e.g. ['employees.view', 'employees.edit']);
 * `onChange` receives the updated array. Read-only when `onChange` is absent.
 */
export function PermissionMatrix({ value = [], onChange }) {
  const readOnly = !onChange

  const isChecked = (resource, action) => value.includes(`${resource}.${action}`)

  const toggle = (resource, action) => {
    if (readOnly) return
    const key = `${resource}.${action}`
    onChange(value.includes(key) ? value.filter((v) => v !== key) : [...value, key])
  }

  return (
    <table className="permission-matrix">
      <thead>
        <tr>
          <th>Resurs</th>
          {ALL_ACTIONS.map((action) => (
            <th key={action}>{ACTION_LABELS[action]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {PERMISSION_SCHEMA.map(({ resource, label, actions }) => (
          <tr key={resource}>
            <td className="permission-matrix__resource">{label}</td>
            {ALL_ACTIONS.map((action) =>
              actions.includes(action) ? (
                <td key={action}>
                  <input
                    type="checkbox"
                    checked={isChecked(resource, action)}
                    onChange={() => toggle(resource, action)}
                    disabled={readOnly}
                    aria-label={`${label} ${ACTION_LABELS[action]}`}
                  />
                </td>
              ) : (
                <td key={action} aria-hidden="true" />
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
