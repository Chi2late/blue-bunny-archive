import { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ItineraryList } from '../components/ItineraryList'
import { PlaceSheet } from '../components/PlaceSheet'
import { useTravel } from '../hooks/useTravel'
import { displayEnglishDate } from '../utils/date'
import { dayItems, tripDays } from '../utils/selectors'

export function DayPage() {
  const { tripId, dayId } = useParams()
  const data = useTravel()
  const trip = data.trips.find(entry => entry.id === tripId)
  const days = tripDays(data, tripId ?? '')
  const day = days.find(entry => entry.id === dayId)
  const items = dayItems(data, dayId ?? '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  if (!trip || !day) return <main className="page missing-page"><h1>走错路了。</h1><Link to="/">回到旅程 →</Link></main>
  const dayNumber = days.findIndex(entry => entry.id === day.id) + 1
  return <main className="page day-page">
    <Link to={`/trips/${trip.id}`} className="back-link"><ArrowLeft size={18} /> {trip.city}旅程</Link>
    <div className="overline">{trip.city.toUpperCase()} / ITINERARY</div>
    <div className="day-heading"><h1>Day {dayNumber}<br /><em>{displayEnglishDate(day.date)}</em></h1><Link className="round-link" to={`/trips/${trip.id}/route/${day.id}`} aria-label="查看路线"><ArrowRight size={22} /></Link></div>
    <div className="day-tabs" role="navigation" aria-label="切换日期">{days.map((entry, index) => <Link className={entry.id === day.id ? 'active' : ''} key={entry.id} to={`/trips/${trip.id}/day/${entry.id}`}><strong>Day {index + 1}</strong><small>{displayEnglishDate(entry.date)}</small></Link>)}</div>
    <div className="section-line"><span>当天路线</span><span>{String(items.length).padStart(2, '0')} PLACES</span></div>
    {items.length > 0 ? <><p className="drag-tip">长按右侧手柄可调整顺序</p><ItineraryList dayId={day.id} items={items} places={data.places} onEdit={id => { setEditingId(id); setSheetOpen(true) }} /></> : <div className="empty-days"><strong>这一天还空着。</strong><p>先加一个想去的地方。</p></div>}
    {items.length > 12 && <p className="easter-note">真的全都要去吗？</p>}
    <button className="add-day-button" type="button" onClick={() => { setEditingId(null); setSheetOpen(true) }}><Plus size={18} /> 添加地点</button>
    <Link className="route-cta" to={`/trips/${trip.id}/route/${day.id}`}>查看当天路线 <ArrowRight size={18} /></Link>
    {sheetOpen && <PlaceSheet key={editingId ?? 'new'} data={data} tripId={trip.id} dayId={day.id} item={data.items.find(entry => entry.id === editingId)} onClose={() => setSheetOpen(false)} />}
  </main>
}
