import { ArrowUpRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTravel } from '../hooks/useTravel'
import { tripDateRange, tripLength } from '../utils/date'

export function HomePage() {
  const data = useTravel()
  const featured = data.trips.find(trip => trip.coverUrl) ?? data.trips[0]
  return <main className="page home-page">
    <div className="eyebrow"><span className="red-spark" /> YOUR TRAVEL JOURNAL <span>{String(data.trips.length).padStart(3, '0')} / TRIPS</span></div>
    <h1>下一站，<br /><em>去看看世界。</em></h1>
    {featured && <Link to={`/trips/${featured.id}`} className={`feature-trip ${featured.coverUrl ? '' : 'plain-cover'}`} aria-label={`查看${featured.city}旅程`}>
      {featured.coverUrl && <div className="feature-photo"><img src={featured.coverUrl} alt={`${featured.city}旅行封面`} /></div>}
      <div className="feature-overlay"><div className="feature-kicker">NEXT TRIP <span>{String(tripLength(featured.startDate, featured.endDate)).padStart(2, '0')} DAYS</span></div><div className="feature-city">{featured.city === '青岛' ? 'QINGDAO' : featured.city.toUpperCase()}</div><div className="feature-bottom"><span>{tripDateRange(featured.startDate, featured.endDate)}<br /><b>先惦记着。</b></span><ArrowUpRight size={26} /></div></div>
    </Link>}
    <div className="section-line"><span>我的旅程</span><span>TRIPS / {String(data.trips.length).padStart(3, '0')}</span></div>
    {data.trips.map((trip, index) => <Link className="trip-teaser" to={`/trips/${trip.id}`} key={trip.id}><strong>{String(index + 1).padStart(2, '0')}</strong><span>{trip.title}<br /><small>{tripLength(trip.startDate, trip.endDate)} DAYS · {tripDateRange(trip.startDate, trip.endDate)}</small></span><ArrowUpRight size={21} /></Link>)}
    <Link className="create-button" to="/trips/new"><Plus size={20} /> 新建旅程 <span>→</span></Link>
    <p className="photo-credit">封面照片：<a href="https://commons.wikimedia.org/wiki/File:Qingdao_Pier.jpg" target="_blank" rel="noreferrer">Bridget Coila</a> · <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">CC BY-SA 2.0</a> · 裁切展示</p>
  </main>
}
