import { useState } from 'react'
import { FormField } from '../../../components/FormField/FormField'
import { Input } from '../../../components/Input/Input'
import { Select } from '../../../components/Select/Select'
import { Button } from '../../../components/Button/Button'
import { validate, rules } from '../../../utils/validators'
import { CUSTOMER_STATUSES, CUSTOMER_STATUS_LABELS } from '../customers.constants'

const DEFAULT_VALUES = { name: '', phone: '', email: '', assignedEmployeeId: '', status: 'active' }

export function CustomerForm({ initialValues = DEFAULT_VALUES, employees = [], submitLabel = 'Saqlash', loading, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values, {
      name: [rules.required('Ism kiritilishi shart')],
      phone: [rules.required('Telefon kiritilishi shart')],
      email: [rules.email()],
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField label="To‘liq ism" required error={errors.name}>
        <Input value={values.name} onChange={handleChange('name')} error={!!errors.name} disabled={loading} />
      </FormField>

      <FormField label="Telefon" required error={errors.phone}>
        <Input value={values.phone} onChange={handleChange('phone')} error={!!errors.phone} disabled={loading} />
      </FormField>

      <FormField label="Elektron pochta" error={errors.email}>
        <Input type="email" value={values.email} onChange={handleChange('email')} error={!!errors.email} disabled={loading} />
      </FormField>

      <FormField label="Mas'ul xodim">
        <Select value={values.assignedEmployeeId} onChange={handleChange('assignedEmployeeId')} disabled={loading}>
          <option value="">Tanlanmagan</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Holat">
        <Select value={values.status} onChange={handleChange('status')} disabled={loading}>
          {CUSTOMER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CUSTOMER_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="card__footer" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Bekor qilish
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
