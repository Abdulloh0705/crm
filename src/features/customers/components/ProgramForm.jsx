import { useState } from 'react'
import { FormField } from '../../../components/FormField/FormField'
import { Input } from '../../../components/Input/Input'
import { Select } from '../../../components/Select/Select'
import { Button } from '../../../components/Button/Button'
import { validate, rules } from '../../../utils/validators'
import { PROGRAM_STATUSES, PROGRAM_STATUS_LABELS } from '../customers.constants'

const DEFAULT_VALUES = { name: '', version: '', startDate: '', installedDate: '', status: 'ACTIVE', subscriptionUntil: '', notes: '' }

export function ProgramForm({ initialValues = DEFAULT_VALUES, submitLabel = 'Saqlash', loading, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values, { name: [rules.required('Dastur nomi kiritilishi shart')] })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField label="Dastur" required error={errors.name}>
        <Input value={values.name} onChange={handleChange('name')} error={!!errors.name} disabled={loading} placeholder="Masalan: Bito POS" />
      </FormField>
      <div className="detail-grid">
        <FormField label="Versiya">
          <Input value={values.version} onChange={handleChange('version')} disabled={loading} />
        </FormField>
        <FormField label="Holati">
          <Select value={values.status} onChange={handleChange('status')} disabled={loading}>
            {PROGRAM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROGRAM_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Boshlangan sana">
          <Input type="date" value={values.startDate} onChange={handleChange('startDate')} disabled={loading} />
        </FormField>
        <FormField label="O‘rnatilgan sana">
          <Input type="date" value={values.installedDate} onChange={handleChange('installedDate')} disabled={loading} />
        </FormField>
        <FormField label="Obuna muddati">
          <Input type="date" value={values.subscriptionUntil} onChange={handleChange('subscriptionUntil')} disabled={loading} />
        </FormField>
      </div>
      <FormField label="Izoh">
        <Input value={values.notes} onChange={handleChange('notes')} disabled={loading} />
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
