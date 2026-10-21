import { useEffect } from 'react'
import { ArrowRight, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cityStampUrl } from '../../data/cities'
import type { City, TravelData } from '../../models/travel'

export function CityArchiveModal({ city, data, onClose }: { city: City; data: TravelData; onClose: () => void }) {
  const checkIns = data.checkIns.filter(entry => entry.cityId === city.id).sort((a, b) => a.checkedAt.localeCompare(b.checkedAt))
  const tripIds = [...new Set(checkIns.map(entry => entry.tripId))]
  const placeIds = [...new Set(checkIns.map(entry => entry.placeId))]
  const trips = tripIds.map(id => data.trips.find(trip => trip.id === id)).filter(Boolean)
  const places = placeIds.map(id => data.places.find(place => place.id === id)).filter(Boolean)
  const cover = trips.find(trip => trip?.coverUrl)?.coverUrl
  const stamp = cityStampUrl(city)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return <div className="city-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="city-archive-modal" role="dialog" aria-modal="true" aria-labelledby="city-archive-title">
      <button type="button" className="city-modal-close" onClick={onClose} aria-label="关闭城市档案"><X size={21} /></button>
      {cover && <img className="city-archive-cover" src={cover} alt={`${city.name}旅行封面`} />}
      <div className="city-archive-heading"><span className="overline">CITY ARCHIVE / ARRIVED</span><h2 id="city-archive-title">{city.englishName ?? city.name.toUpperCase()}</h2><p>{city.name}{city.province && city.province !== city.name ? ` · ${city.province}` : ''}</p></div>
      <div className="city-archive-stats"><div><strong>{tripIds.length}</strong><span>TRIPS</span></div><div><strong>{placeIds.length}</strong><span>PLACES</span></div><div><strong>{checkIns.length}</strong><span>CHECK-INS</span></div></div>
      {stamp ? <img className="city-stamp" src={stamp} alt={`${city.name}城市印章`} loading="lazy" /> : <div className="city-stamp-fallback"><span>BLUE BUNNY ARCHIVE</span><strong>{city.name}</strong><small>ARRIVED · 已抵达</small></div>}
      <div className="city-archive-section"><span className="section-label">第一次抵达</span><strong>{checkIns[0] ? new Date(checkIns[0].checkedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</strong></div>
      <div className="city-archive-section"><span className="section-label">去过地点</span><div className="archive-place-list">{places.map(place => place && <div key={place.id}><MapPin size={15} /><span>{place.name}</span></div>)}</div></div>
      <div className="city-archive-section"><span className="section-label">相关旅行</span>{trips.map(trip => trip && <Link key={trip.id} to={`/trips/${trip.id}`} onClick={onClose}><span>{trip.title}</span><ArrowRight size={16} /></Link>)}</div>
    </section>
  </div>
}
