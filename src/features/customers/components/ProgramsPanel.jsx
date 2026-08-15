import { useState } from 'react'
import { customersService } from '../../../services/customers.service'
import { Card } from '../../../components/Card/Card'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Modal } from '../../../components/Modal/Modal'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Dropdown, DropdownItem } from '../../../components/Dropdown/Dropdown'
import { ProgramForm } from './ProgramForm'
import { PROGRAM_STATUS_LABELS, PROGRAM_STATUS_BADGE_VARIANTS } from '../customers.constants'
import { useAction } from '../../../hooks/useAction'
import { useDisclosure } from '../../../hooks/useDisclosure'
import { useConfirm } from '../../../store/ConfirmContext'
import { useToast } from '../../../store/ToastContext'
import { formatDate } from '../../../utils/formatDate'
import { MoreIcon, InboxIcon } from '../../../components/icons/Icons'
import './ProgramsPanel.scss'

export function ProgramsPanel({ customerId, programs = [], onChanged }) {
  const [editingProgram, setEditingProgram] = useState(null)
  const programModal = useDisclosure()
  const confirm = useConfirm()
  const toast = useToast()

  const saveAction = useAction((values) =>
    editingProgram ? customersService.updateProgram(customerId, editingProgram.id, values) : customersService.addProgram(customerId, values)
  )
  const removeAction = useAction((programId) => customersService.removeProgram(customerId, programId))

  const openCreate = () => {
    setEditingProgram(null)
    programModal.open()
  }
  const openEdit = (program) => {
    setEditingProgram(program)
    programModal.open()
  }

  const handleSave = async (values) => {
    try {
      await saveAction.run(values)
      toast.success(editingProgram ? 'Dastur yangilandi' : 'Dastur qo‘shildi')
      programModal.close()
      onChanged?.()
    } catch (err) {
      toast.error(err.message || 'Dasturni saqlashda xatolik yuz berdi')
    }
  }

  const handleRemove = async (program) => {
    const ok = await confirm({
      title: 'Dasturni o‘chirish',
      description: `"${program.name}" dasturini bu mijozdan o‘chirmoqchimisiz?`,
      confirmLabel: 'O‘chirish',
      danger: true,
    })
    if (!ok) return
    try {
      await removeAction.run(program.id)
      toast.success('Dastur o‘chirildi')
      onChanged?.()
    } catch (err) {
      toast.error(err.message || 'Dasturni o‘chirishda xatolik yuz berdi')
    }
  }

  return (
    <>
      <Card
        title="Dasturlar"
        actions={
          <Button size="sm" onClick={openCreate}>
            + Dastur qo‘shish
          </Button>
        }
      >
        {programs.length === 0 && <EmptyState compact icon={<InboxIcon width={20} height={20} />} title="Hali dastur qo‘shilmagan" />}
        {programs.length > 0 && (
          <div className="stack">
            {programs.map((program) => (
              <div key={program.id} className="program-row">
                <div className="program-row__main">
                  <span className="program-row__name">{program.name}</span>
                  {program.version && <span className="text-muted text-xs">v{program.version}</span>}
                  <Badge variant={PROGRAM_STATUS_BADGE_VARIANTS[program.status] || 'gray'}>
                    {PROGRAM_STATUS_LABELS[program.status] || program.status}
                  </Badge>
                </div>
                <div className="program-row__meta text-muted text-xs">
                  {program.installedDate ? `O‘rnatilgan: ${formatDate(program.installedDate)}` : program.startDate ? `Boshlangan: ${formatDate(program.startDate)}` : ''}
                  {program.subscriptionUntil ? ` · Obuna: ${formatDate(program.subscriptionUntil)} gacha` : ''}
                </div>
                <Dropdown
                  trigger={(toggle) => (
                    <button type="button" className="header__icon-btn" onClick={toggle} aria-label="Amallar">
                      <MoreIcon width={16} height={16} />
                    </button>
                  )}
                >
                  <DropdownItem onClick={() => openEdit(program)}>Tahrirlash</DropdownItem>
                  <DropdownItem danger onClick={() => handleRemove(program)}>
                    O‘chirish
                  </DropdownItem>
                </Dropdown>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={programModal.isOpen} title={editingProgram ? 'Dasturni tahrirlash' : 'Dastur qo‘shish'} onClose={programModal.close}>
        <ProgramForm
          initialValues={editingProgram ?? undefined}
          submitLabel={editingProgram ? 'Saqlash' : 'Qo‘shish'}
          loading={saveAction.loading}
          onSubmit={handleSave}
          onCancel={programModal.close}
        />
      </Modal>
    </>
  )
}
