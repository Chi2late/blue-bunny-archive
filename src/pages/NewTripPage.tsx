import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { travelRepository } from '../repositories/travelRepository'
import { addDays, toISO } from '../utils/date'

export function NewTripPage() {
  const navigate = useNavigate()
  const today = toISO(new Date())
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [startDate, setStartDate] = useState(addDays(today, 14))
  const [endDate, setEndDate] = useState(addDays(today, 17))
  const [companions, setCompanions] = useState('')
  const [cover, setCover] = useState<'blue' | 'qingdao'>('blue')
  const [error, setError] = useState('')
  function next(event: React.FormEvent) {
    event.preventDefault()
    if (!city.trim()) { setError('先写下要去的城市'); return }
    if (endDate < startDate) { setError('结束日期不能早于开始日期'); return }
    if (city.trim() !== '青岛') setCover('blue')
    setError(''); setStep(2)
  }
  function create() {
    const trip = travelRepository.createTrip({ city: city.trim(), title: `${city.trim()}旅行`, startDate, endDate, companions: ['我', ...companions.split(/[，,、]/).map(name => name.trim()).filter(Boolean)], coverUrl: cover === 'qingdao' && city.trim() === '青岛' ? './qingdao-pier.jpg' : undefined })
    navigate(`/trips/${trip.id}`, { state: { created: true } })
  }
  return <main className="page form-page">
    <Link to="/" className="back-link"><ArrowLeft size={18} /> 返回旅程</Link>
    <div className="overline">NEW JOURNEY / 0{step} OF 02</div>
    <h1>{step === 1 ? <>去哪？<br /><em>先把日子定下来。</em></> : <>给这段旅程<br /><em>选一张封面。</em></>}</h1>
    <div className="step-rule"><span className="current" /><span className={step === 2 ? 'current' : ''} /></div>
    {step === 1 ? <form onSubmit={next} className="trip-form">
      <label className="field">目的地<input value={city} onChange={event => { setCity(event.target.value); setError('') }} placeholder="例如：青岛" autoFocus /></label>
      <div className="field-row"><label className="field">开始日期<input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} required /></label><label className="field">结束日期<input type="date" min={startDate} value={endDate} onChange={event => setEndDate(event.target.value)} required /></label></div>
      <label className="field">同行人 <small>可选，多个名字用逗号分开</small><input value={companions} onChange={event => setCompanions(event.target.value)} placeholder="例如：小王、小陈" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="primary-button wide">下一步 <ArrowRight size={19} /></button>
    </form> : <div className="cover-step">
      <div className="cover-options"><button type="button" className={`cover-option blue-option ${cover === 'blue' ? 'selected' : ''}`} onClick={() => setCover('blue')}><span>BLUE BUNNY<br />ARCHIVE</span><b>{city}</b>{cover === 'blue' && <Check size={20} />}</button>{city.trim() === '青岛' && <button type="button" className={`cover-option photo-option ${cover === 'qingdao' ? 'selected' : ''}`} onClick={() => setCover('qingdao')}><img src="./qingdao-pier.jpg" alt="青岛栈桥" /><b>青岛实景</b>{cover === 'qingdao' && <Check size={20} />}</button>}</div>
      <p className="quiet-note">也可以先用默认蓝色封面。</p>
      <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}><ArrowLeft size={18} /> 上一步</button><button type="button" className="primary-button" onClick={create}>创建旅程 <ArrowRight size={18} /></button></div>
    </div>}
  </main>
}
