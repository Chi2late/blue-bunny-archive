import { Compass, Images, Map, MapPin, Plus, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTravel } from '../hooks/useTravel'

export function Layout() {
  const data = useTravel()
  const activeTrip = data.trips[0]
  const firstDay = data.days.filter(day => day.tripId === activeTrip?.id).sort((a, b) => a.order - b.order)[0]
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand-link" to="/" aria-label="Blue Bunny Archive 首页"><img src="./favicon.svg" alt="" /><span>BLUE BUNNY <i>ARCHIVE</i></span></Link>
      <Link className="header-action" to="/trips/new" aria-label="新建旅程"><Plus size={20} /></Link>
    </header>
    <Outlet />
    <nav className="bottom-nav" aria-label="主导航">
      <NavLink to="/" end><Compass size={21} /><span>旅程</span></NavLink>
      <NavLink to={firstDay ? `/trips/${activeTrip.id}/route/${firstDay.id}` : '/'} className={({ isActive }) => isActive && firstDay ? 'active' : ''}><Map size={21} /><span>路线</span></NavLink>
      <NavLink to="/footprints"><MapPin size={21} /><span>足迹</span></NavLink>
      <button type="button" disabled aria-label="照片，后续开放"><Images size={21} /><span>照片</span></button>
      <button type="button" disabled aria-label="我的，后续开放"><UserRound size={21} /><span>我的</span></button>
    </nav>
  </div>
}
