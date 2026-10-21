import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Map as MapIcon, Plus } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { SchematicMap } from '../components/SchematicMap'
import { useTravel } from '../hooks/useTravel'
import { travelRepository } from '../repositories/travelRepository'
import { addDays, displayDate, displayEnglishDate, tripDateRange, tripLength } from '../utils/date'
import { dayItems, tripDays } from '../utils/selectors'

export function TripPage() {
  const { tripId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const data = useTravel()
  const trip = data.trips.find(entry => entry.id === tripId)
  const days = tripDays(data, tripId ?? '')
  const [date, setDate] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const dates = useMemo(() => {
    if (!trip) return []
    return Array.from({ length: Math.min(tripLength(trip.startDate, trip.endDate), 90) }, (_, index) => addDays(trip.startDate, index))
  }, [trip])
  if (!trip) return <main className="page missing-page"><h1>走错路了。</h1><Link to="/">回到旅程 →</Link></main>
  const nextDate = dates.find(value => !days.some(day => day.date === value))
  const firstDay = days[0]
  const firstItems = firstDay ? dayItems(data, firstDay.id) : []
  function addDay(event: React.FormEvent) {
    event.preventDefault()
    const targetDate = date || nextDate
    if (!targetDate) return
    const day = travelRepository.addDay(trip!.id, targetDate)
    setShowAdd(false)
    navigate(`/trips/${trip!.id}/day/${day.id}`)
  }
  return <main className="page trip-page">
    <Link to="/" className="back-link"><ArrowLeft size={18} /> 全部旅程</Link>
    {location.state?.created && <p className="success-note">{trip.city}，先惦记着。</p>}
    <div className="overline">JOURNEY / {trip.id === 'demo-qingdao' ? '001' : 'NEW'}</div>
    <h1 className="city-heading">{trip.city === '青岛' ? 'QINGDAO' : trip.city.toUpperCase()}</h1>
    <div className="trip-date-line"><span>{tripDateRange(trip.startDate, trip.endDate)}</span><span>{tripLength(trip.startDate, trip.endDate)} DAYS</span></div>
    <div className={`trip-cover ${trip.coverUrl ? '' : 'plain-cover'}`}>
      {trip.coverUrl ? <img src={trip.coverUrl} alt={`${trip.city}封面`} /> : <span className="cover-letter">BB / {trip.city}</span>}
      <span className="cover-tag">SOMEWHERE WORTH REMEMBERING</span>
    </div>
    {trip.coverUrl && <p className="photo-credit">封面照片：<a href="https://commons.wikimedia.org/wiki/File:Qingdao_Pier.jpg" target="_blank" rel="noreferrer">Bridget Coila</a> · <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">CC BY-SA 2.0</a> · 裁切展示</p>}
    <div className="trip-intro"><span>01 / PLAN</span><p>今天适合乱走。</p></div>
    <div className="section-line"><span>每日行程</span><span>DAYS / {String(days.length).padStart(2, '0')}</span></div>
    {days.length === 0 && <div className="empty-days"><CalendarDays size={30} /><strong>先安排第一天。</strong><p>建好日期，就可以添加想去的地点。</p></div>}
    {days.map((day, index) => <Link key={day.id} to={`/trips/${trip.id}/day/${day.id}`} className="day-summary"><span className="day-index">0{index + 1}</span><span><strong>Day {index + 1}</strong><small>{displayDate(day.date)} · {dayItems(data, day.id).length} 个地点</small></span><ArrowRight size={20} /></Link>)}
    {nextDate && (showAdd ? <form className="add-day-form" onSubmit={addDay}><label className="field">选择日期<select value={date || nextDate} onChange={event => setDate(event.target.value)}>{dates.filter(value => !days.some(day => day.date === value)).map(value => <option key={value} value={value}>{displayDate(value)} · {displayEnglishDate(value)}</option>)}</select></label><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>取消</button><button type="submit" className="primary-button">建立 Day</button></div></form> : <button className="add-day-button" type="button" onClick={() => setShowAdd(true)}><Plus size={18} /> 添加一天</button>)}
    {firstDay && <><div className="section-line map-section-title"><span>路线预览</span><Link to={`/trips/${trip.id}/route/${firstDay.id}`}>查看路线 <ArrowRight size={15} /></Link></div><Link to={`/trips/${trip.id}/route/${firstDay.id}`} className="map-preview-link" aria-label="查看第一天路线"><SchematicMap items={firstItems} places={data.places} /></Link></>}
    <p className="trip-footer-note"><MapIcon size={15} /> 先留下路线，故事以后慢慢写。</p>
  </main>
}
