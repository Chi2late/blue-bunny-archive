import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Camera, Coffee, GripVertical, Hotel, MapPin, Pencil, ShoppingBag, TrainFront, Utensils } from 'lucide-react'
import type { CheckIn, ItineraryItem, Place, PlaceType } from '../models/travel'
import { travelRepository } from '../repositories/travelRepository'

const typeLabels: Record<PlaceType, string> = { sight: '景点', food: '咖啡 / 餐厅', transport: '交通', stay: '住宿', shop: '购物', photo: '拍照点', other: '其他' }
const typeIcons = { sight: MapPin, food: Coffee, transport: TrainFront, stay: Hotel, shop: ShoppingBag, photo: Camera, other: Utensils }

function SortableRow({ item, place, onEdit, index, compact, checked }: { item: ItineraryItem; place?: Place; onEdit: (id: string) => void; index: number; compact?: boolean; checked: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const Icon = typeIcons[place?.type ?? 'other']
  return <div ref={setNodeRef} className={`itinerary-row ${compact ? 'compact' : ''} ${checked ? 'checked' : ''} ${isDragging ? 'dragging' : ''}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
    <div className="timeline-time">{item.time || String(index + 1).padStart(2, '0')}</div>
    <div className="timeline-node" />
    <button type="button" className="itinerary-main" onClick={() => onEdit(item.id)} aria-label={`编辑${place?.name ?? '地点'}`}>
      <span className="itinerary-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="itinerary-copy"><strong>{place?.name ?? '未知地点'}</strong><small><Icon size={13} /> {typeLabels[place?.type ?? 'other']}{item.durationMinutes ? ` · ${item.durationMinutes} 分钟` : ''}</small>{!compact && item.note && <em>{item.note}</em>}</span>
      <Pencil size={16} className="edit-icon" />
    </button>
    <button type="button" className="drag-handle" aria-label={`长按拖动${place?.name ?? '地点'}以调整顺序`} {...attributes} {...listeners}><GripVertical size={21} /></button>
  </div>
}

export function ItineraryList({ dayId, items, places, checkIns = [], onEdit, compact = false }: { dayId: string; items: ItineraryItem[]; places: Place[]; checkIns?: CheckIn[]; onEdit: (id: string) => void; compact?: boolean }) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = items.findIndex(item => item.id === active.id)
    const to = items.findIndex(item => item.id === over.id)
    if (from < 0 || to < 0) return
    travelRepository.reorderItems(dayId, arrayMove(items, from, to).map(item => item.id))
  }
  return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
      <div className="itinerary-list">{items.map((item, index) => <SortableRow key={item.id} item={item} place={places.find(place => place.id === item.placeId)} onEdit={onEdit} index={index} compact={compact} checked={checkIns.some(entry => entry.itineraryItemId === item.id)} />)}</div>
    </SortableContext>
  </DndContext>
}
