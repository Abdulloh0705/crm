import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { classNames } from '../../utils/classNames'
import './Drawer.scss'

// Same portal/Escape/backdrop-click contract as Modal, but slides in from
// the right and can hold much longer forms without the page scrolling —
// used for flows with many fields (e.g. "+ Mijoz qo'shish").
export function Drawer({ open, title, subtitle, onClose, footer, children }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={classNames('drawer')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__header">
          <div>
            <h3 className="drawer__title">{title}</h3>
            {subtitle && <p className="drawer__subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Yopish">
            ✕
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
