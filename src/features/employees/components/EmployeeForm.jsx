import { useState } from 'react'
import { FormField } from '../../../components/FormField/FormField'
import { Input } from '../../../components/Input/Input'
import { Select } from '../../../components/Select/Select'
import { Button } from '../../../components/Button/Button'
import { validate, rules } from '../../../utils/validators'
import { ROLES, ROLE_LABELS } from '../../roles/permissions'

const DEFAULT_VALUES = { name: '', email: '', phone: '', role: ROLES.SALES, teamId: '' }

export function EmployeeForm({ initialValues = DEFAULT_VALUES, teams = [], submitLabel = 'Saqlash', loading, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values, {
      name: [rules.required('Ism kiritilishi shart')],
      email: [rules.required('Email kiritilishi shart'), rules.email()],
      role: [rules.required('Rol tanlanishi shart')],
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

      <FormField label="Elektron pochta" required error={errors.email}>
        <Input type="email" value={values.email} onChange={handleChange('email')} error={!!errors.email} disabled={loading} />
      </FormField>

      <FormField label="Telefon">
        <Input value={values.phone} onChange={handleChange('phone')} disabled={loading} />
      </FormField>

      <FormField label="Rol" required error={errors.role}>
        <Select value={values.role} onChange={handleChange('role')} disabled={loading}>
          {Object.values(ROLES).map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Jamoa">
        <Select value={values.teamId} onChange={handleChange('teamId')} disabled={loading}>
          <option value="">Jamoa tanlanmagan</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
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
