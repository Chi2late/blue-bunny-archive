import { useState } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink, ListOrdered, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ItineraryList } from '../components/ItineraryList'
import { PlaceSheet } from '../components/PlaceSheet'
import { SchematicMap } from '../components/SchematicMap'
import { useTravel } from '../hooks/useTravel'
import { schematicMapProvider } from '../services/mapProvider'
import { displayEnglishDate } from '../utils/date'
import { dayItems, tripDays } from '../utils/selectors'

export function RoutePage() {
  const { tripId, dayId } = useParams()
  const data = useTravel()
  const trip = data.trips.find(entry => entry.id === tripId)
  const days = tripDays(data, tripId ?? '')
  const day = days.find(entry => entry.id === dayId)
  const items = dayItems(data, dayId ?? '')
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [planning, setPlanning] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  if (!trip || !day) return <main className="page missing-page"><h1>走错路了。</h1><Link to="/">回到旅程 →</Link></main>
  const selectedItem = items.find(item => item.id === selectedId)
  const selectedPlace = data.places.find(place => place.id === selectedItem?.placeId)
  return <main className="page route-page">
    <Link to={`/trips/${trip.id}/day/${day.id}`} className="back-link"><ArrowLeft size={18} /> 返回行程</Link>
    <div className="route-header"><div><span className="overline">ROUTE / DAY {days.findIndex(entry => entry.id === day.id) + 1}</span><h1>{trip.city.toUpperCase()}</h1><p>{displayEnglishDate(day.date)} · {items.length} 个地点</p></div><button type="button" className={`planning-toggle ${planning ? 'active' : ''}`} onClick={() => setPlanning(!planning)}><ListOrdered size={17} /> {planning ? '完成' : '规划'}</button></div>
    <SchematicMap className="route-map" items={items} places={data.places} selectedId={selectedId} onSelect={setSelectedId} />
    <div className="section-line"><span>{planning ? '拖动调整顺序' : '行走顺序'}</span><span>01 — {String(items.length).padStart(2, '0')}</span></div>
    {planning ? <><p className="drag-tip">长按右侧手柄，地图顺序会同步更新。</p><ItineraryList dayId={day.id} items={items} places={data.places} compact onEdit={id => setEditId(id)} /></> : <div className="route-stops">{items.map((item, index) => { const place = data.places.find(entry => entry.id === item.placeId); return <button type="button" key={item.id} className={selectedId === item.id ? 'selected' : ''} onClick={() => setSelectedId(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{place?.name ?? '未知地点'}</strong><small>{item.time || '未定时间'}</small><ArrowRight size={16} /></button> })}</div>}
    {items.length === 0 && <Link className="add-day-button" to={`/trips/${trip.id}/day/${day.id}`}>返回行程添加地点 <ArrowRight size={17} /></Link>}
    {selectedPlace && selectedItem && <div className="place-detail" role="region" aria-label="地点详情"><span className="overline">PLACE / {String(items.findIndex(item => item.id === selectedId) + 1).padStart(2, '0')}</span><div className="place-detail-title"><h2>{selectedPlace.name}</h2><button type="button" aria-label="编辑地点" onClick={() => setEditId(selectedItem.id)}><Pencil size={18} /></button></div><p>{selectedItem.time || '时间未定'}{selectedItem.durationMinutes ? ` · 预计停留 ${selectedItem.durationMinutes} 分钟` : ''}</p>{selectedItem.note && <p className="place-note">{selectedItem.note}</p>}<a href={schematicMapProvider.navigationUrl(selectedPlace)} target="_blank" rel="noreferrer" className="external-nav">外部地图导航 <ExternalLink size={16} /></a></div>}
    {editId && <PlaceSheet key={editId} data={data} tripId={trip.id} dayId={day.id} item={data.items.find(item => item.id === editId)} onClose={() => setEditId(null)} />}
  </main>
}
