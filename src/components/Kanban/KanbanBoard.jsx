import { useState } from 'react'
import './KanbanBoard.scss'

/**
 * Generic Kanban board using native HTML5 drag-and-drop — no DnD library
 * dependency. `columns` is [{id,label}], `items` is any list, `getColumnId`
 * maps an item to its column id, `renderCard` renders one card,
 * `onCardMove(item, fromColumnId, toColumnId)` fires on drop.
 */
export function KanbanBoard({ columns, items, getColumnId, renderCard, onCardMove }) {
  const [dragItemId, setDragItemId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const itemsByColumn = columns.reduce((acc, column) => {
    acc[column.id] = items.filter((item) => getColumnId(item) === column.id)
    return acc
  }, {})

  const handleDrop = (columnId) => {
    const item = items.find((i) => String(i.id) === String(dragItemId))
    setDragOverColumn(null)
    setDragItemId(null)
    if (!item) return
    const fromColumnId = getColumnId(item)
    if (fromColumnId === columnId) return
    onCardMove?.(item, fromColumnId, columnId)
  }

  return (
    <div className="kanban">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`kanban__column${dragOverColumn === column.id ? ' kanban__column--drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverColumn(column.id)
          }}
          onDragLeave={() => setDragOverColumn((current) => (current === column.id ? null : current))}
          onDrop={(e) => {
            e.preventDefault()
            handleDrop(column.id)
          }}
        >
          <div className="kanban__column-header">
            <span>{column.label}</span>
            <span className="kanban__count">{itemsByColumn[column.id]?.length ?? 0}</span>
          </div>
          <div className="kanban__cards">
            {itemsByColumn[column.id]?.map((item) => (
              <div
                key={item.id}
                className="kanban__card"
                draggable
                onDragStart={() => setDragItemId(item.id)}
                onDragEnd={() => {
                  setDragItemId(null)
                  setDragOverColumn(null)
                }}
              >
                {renderCard(item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
