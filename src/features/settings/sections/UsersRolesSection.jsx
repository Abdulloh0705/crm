import { useState } from 'react'
import { useAsync } from '../../../hooks/useAsync'
import { rolesService } from '../../../services/roles.service'
import { Card } from '../../../components/Card/Card'
import { Alert } from '../../../components/Alert/Alert'
import { Spinner } from '../../../components/Spinner/Spinner'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Button } from '../../../components/Button/Button'
import { PermissionMatrix } from '../../roles/components/PermissionMatrix'
import { PermissionGate } from '../../roles/PermissionGate'
import { ROLE_LABELS } from '../../roles/permissions'
import { SettingsIcon } from '../../../components/icons/Icons'

export function UsersRolesSection() {
  const { data, loading, error } = useAsync(() => rolesService.list(), [])
  const [expandedId, setExpandedId] = useState(null)

  const roles = data?.items ?? []

  return (
    <div className="stack">
      <Card
        title="Rollar va ruxsatlar"
        actions={
          <PermissionGate permission="settings.edit">
            <Button size="sm" disabled>
              Yangi rol
            </Button>
          </PermissionGate>
        }
      >
        <p className="text-muted" style={{ marginBottom: 16 }}>
          Har bir rol qaysi resurslarga (Mijozlar, Murojaatlar, Savdolar, To‘lovlar, O‘rnatishlar, Xodimlar, Jamoalar, Sozlamalar) qanday
          kirish huquqiga ega ekanini shu yerda boshqarasiz. Bu faqat interfeys darajasidagi tekshiruv — haqiqiy avtorizatsiya
          backendda amalga oshiriladi.
        </p>

        {error && (
          <Alert variant="danger" title="Rollarni yuklab bo‘lmadi">
            {error.message}
          </Alert>
        )}

        {loading && !error && (
          <div className="page-loading">
            <Spinner />
          </div>
        )}

        {!loading && !error && roles.length === 0 && (
          <EmptyState
            compact
            icon={<SettingsIcon width={20} height={20} />}
            title="Rollar topilmadi"
            description="Backend /roles endpointi ulanganidan so‘ng rollar shu yerda ko‘rinadi."
          />
        )}

        {!loading && !error && roles.length > 0 && (
          <div className="stack">
            {roles.map((role) => (
              <div key={role.id}>
                <button
                  type="button"
                  className="settings-nav__item"
                  style={{ width: '100%' }}
                  onClick={() => setExpandedId(expandedId === role.id ? null : role.id)}
                >
                  {ROLE_LABELS[role.name] || role.name}
                </button>
                {expandedId === role.id && (
                  <div style={{ overflowX: 'auto', marginTop: 8 }}>
                    <PermissionMatrix value={role.permissions ?? []} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
