import { useCallback, useMemo, useState } from 'react'
import { ArrowRight, MapPin } from 'lucide-react'
import { CityArchiveModal } from '../components/footprint/CityArchiveModal'
import { FootprintMap, type ResolvedCity } from '../components/footprint/FootprintMap'
import { useTravel } from '../hooks/useTravel'

export function FootprintPage() {
  const data = useTravel()
  const [selectedCityId, setSelectedCityId] = useState<string>()
  const [resolved, setResolved] = useState<ResolvedCity[]>([])
  const visitedCityIds = useMemo(() => new Set(data.checkIns.map(entry => entry.cityId)), [data.checkIns])
  const visitedCities = useMemo(() => data.cities.filter(city => visitedCityIds.has(city.id)), [data.cities, visitedCityIds])
  const onResolved = useCallback((entries: ResolvedCity[]) => setResolved(entries), [])
  const provinceCount = new Set(resolved.map(entry => entry.provinceName).filter(Boolean)).size
  const selectedCity = data.cities.find(city => city.id === selectedCityId)

  const visits = useMemo(() => {
    const seen = new Set<string>()
    return [...data.checkIns].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt)).filter(checkIn => {
      const key = `${checkIn.tripId}:${checkIn.cityId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [data.checkIns])
  const years = [...new Set(visits.map(visit => new Date(visit.checkedAt).getFullYear()))]

  return <main className="page footprint-page">
    <div className="footprint-heading"><div><span className="overline">YOUR TRAVEL TRACE</span><h1>FOOTPRINT</h1></div><div className="footprint-count"><strong>{String(visitedCities.length).padStart(2, '0')}</strong><span>CITIES</span></div></div>
    <div className="footprint-meta"><span>{provinceCount || '—'} PROVINCES</span><span>{data.checkIns.length} CHECK-INS</span></div>
    <FootprintMap cities={visitedCities} selectedCityId={selectedCityId} onSelect={setSelectedCityId} onResolved={onResolved} />
    <div className="map-source">ADMINISTRATIVE BOUNDARIES · DATAV GEOATLAS</div>
    <div className="section-line footprint-timeline-title"><span>旅行年表</span><span>ARRIVAL LOG</span></div>
    {visits.length === 0 ? <div className="footprint-empty"><MapPin size={27} /><strong>地图还没有亮起来。</strong><p>在路线页抵达一个地点后，城市足迹会出现在这里。</p></div> : years.map(year => <section className="footprint-year" key={year}><h2>{year}</h2>{visits.filter(visit => new Date(visit.checkedAt).getFullYear() === year).map(visit => { const city = data.cities.find(entry => entry.id === visit.cityId); const trip = data.trips.find(entry => entry.id === visit.tripId); return city && <button type="button" key={`${visit.tripId}:${visit.cityId}`} onClick={() => setSelectedCityId(city.id)}><span><strong>{city.englishName ?? city.name}</strong><small>{city.name} · {trip?.title}</small></span><time>{new Date(visit.checkedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()}</time><ArrowRight size={17} /></button> })}</section>)}
    {selectedCity && <CityArchiveModal city={selectedCity} data={data} onClose={() => setSelectedCityId(undefined)} />}
  </main>
}
