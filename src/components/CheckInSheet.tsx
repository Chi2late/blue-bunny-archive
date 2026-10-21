import { useEffect, useState } from 'react'
import { Check, MapPin, X } from 'lucide-react'
import type { CheckIn, Place } from '../models/travel'
import { travelRepository } from '../repositories/travelRepository'

export function CheckInSheet({ checkIn, place, onClose }: { checkIn: CheckIn; place: Place; onClose: () => void }) {
  const [note, setNote] = useState(checkIn.note)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function save(event: React.FormEvent) {
    event.preventDefault()
    travelRepository.updateCheckInNote(checkIn.id, note)
    onClose()
  }

  return <div className="sheet-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="checkin-sheet" role="dialog" aria-modal="true" aria-labelledby="checkin-title">
      <div className="sheet-grip" />
      <div className="sheet-heading"><div><span className="overline">CHECK IN / ARRIVED</span><h2 id="checkin-title">已经留下足迹。</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><X size={22} /></button></div>
      <div className="checkin-place"><span><MapPin size={19} /></span><div><strong>{place.name}</strong><small>{place.city} · {new Date(checkIn.checkedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small></div></div>
      <form onSubmit={save}>
        <label className="field">写一句话<textarea rows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="这里适合浪费一点时间。" autoFocus /></label>
        <div className="checkin-actions"><button type="button" className="secondary-button" onClick={onClose}>稍后再说</button><button type="submit" className="primary-button"><Check size={18} /> 保存</button></div>
      </form>
    </section>
  </div>
}
