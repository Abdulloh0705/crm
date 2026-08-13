import { useState } from 'react'
import { classNames } from '../../../utils/classNames'
import { GeneralSection } from '../sections/GeneralSection'
import { UsersRolesSection } from '../sections/UsersRolesSection'
import { TeamsSection } from '../sections/TeamsSection'
import './SettingsPage.scss'

// Registry pattern: adding Notifications/Security/Integrations later is just
// one more entry here plus its section component — no routing changes needed.
const SECTIONS = [
  { id: 'general', label: 'Umumiy', Component: GeneralSection },
  { id: 'users-roles', label: 'Foydalanuvchilar va rollar', Component: UsersRolesSection },
  { id: 'teams', label: 'Jamoalar', Component: TeamsSection },
]

export function SettingsPage() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const ActiveComponent = SECTIONS.find((s) => s.id === activeId)?.Component

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">Sozlamalar</h2>
          <p className="page-header__subtitle">Tizim sozlamalari</p>
        </div>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={classNames('settings-nav__item', activeId === section.id && 'settings-nav__item--active')}
              onClick={() => setActiveId(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="settings-content">{ActiveComponent && <ActiveComponent />}</div>
      </div>
    </div>
  )
}
