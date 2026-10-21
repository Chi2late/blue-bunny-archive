import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { NewTripPage } from './pages/NewTripPage'
import { TripPage } from './pages/TripPage'
import { DayPage } from './pages/DayPage'
import { RoutePage } from './pages/RoutePage'

function App() {
  return <HashRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/trips/new" element={<NewTripPage />} />
        <Route path="/trips/:tripId" element={<TripPage />} />
        <Route path="/trips/:tripId/day/:dayId" element={<DayPage />} />
        <Route path="/trips/:tripId/route/:dayId" element={<RoutePage />} />
        <Route path="*" element={<main className="page missing-page"><h1>走错路了。</h1><a href="#/">回到旅程 →</a></main>} />
      </Route>
    </Routes>
  </HashRouter>
}

export default App
