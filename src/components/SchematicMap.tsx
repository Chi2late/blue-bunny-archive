import { useMemo } from 'react'
import type { ItineraryItem, Place } from '../models/travel'
import { schematicMapProvider } from '../services/mapProvider'

interface Props {
  items: ItineraryItem[]
  places: Place[]
  selectedId?: string
  onSelect?: (id: string) => void
  className?: string
}

export function SchematicMap({ items, places, selectedId, onSelect, className = '' }: Props) {
  const points = useMemo(() => schematicMapProvider.getPoints(items, places), [items, places])
  const line = points.map(point => `${point.x},${point.y}`).join(' ')
  return <div className={`schematic-map ${className}`} role="group" aria-label="当天路线示意图">
    <div className="map-grid" />
    {points.length > 1 && <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={line} fill="none" stroke="var(--blue)" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 1.3" /></svg>}
    {points.map((point, index) => <button
      key={point.id}
      className={`map-marker ${selectedId === point.id ? 'selected' : ''}`}
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
      onClick={() => onSelect?.(point.id)}
      type="button"
      aria-label={`第 ${index + 1} 站，${point.name}`}
    >{index + 1}</button>)}
    {points.length === 0 && <div className="map-empty"><span>ROUTE / 00</span><p>添加地点后，路线会出现在这里。</p></div>}
    <span className="map-caption">ROUTE SKETCH · 顺序示意</span>
  </div>
}
