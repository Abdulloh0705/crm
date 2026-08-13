import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { usersService } from '../../../services/users.service'
import { Card } from '../../../components/Card/Card'
import { Avatar } from '../../../components/Avatar/Avatar'
import { FormField } from '../../../components/FormField/FormField'
import { Input } from '../../../components/Input/Input'
import { Button } from '../../../components/Button/Button'
import { useAction } from '../../../hooks/useAction'
import { useToast } from '../../../store/ToastContext'
import { ROLE_LABELS } from '../../roles/permissions'
import './ProfilePage.scss'

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const updateAction = useAction(usersService.updateProfile)

  const [values, setValues] = useState({ name: user?.name || '', phone: user?.phone || '' })

  const handleChange = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await updateAction.run(values)
      await refreshUser()
      toast.success('Profil yangilandi')
    } catch (err) {
      toast.error(err.message || 'Profilni yangilashda xatolik yuz berdi')
    }
  }

  return (
    <div className="stack">
      <div className="profile-header">
        <Avatar name={user?.name} src={user?.avatarUrl} size="xl" />
        <div>
          <div className="profile-header__name">{user?.name}</div>
          <div className="profile-header__role">{ROLE_LABELS[user?.role] || user?.role}</div>
        </div>
      </div>

      <Card title="Shaxsiy ma'lumotlar">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="To‘liq ism">
            <Input value={values.name} onChange={handleChange('name')} disabled={updateAction.loading} />
          </FormField>
          <FormField label="Elektron pochta">
            <Input value={user?.email || ''} disabled />
          </FormField>
          <FormField label="Telefon">
            <Input value={values.phone} onChange={handleChange('phone')} disabled={updateAction.loading} />
          </FormField>
          <FormField label="Rol">
            <Input value={ROLE_LABELS[user?.role] || user?.role || ''} disabled />
          </FormField>
          <FormField label="Jamoa">
            <Input value={user?.team?.name || 'Tayinlanmagan'} disabled />
          </FormField>
          <Button type="submit" loading={updateAction.loading}>
            Saqlash
          </Button>
        </form>
      </Card>
    </div>
  )
}
