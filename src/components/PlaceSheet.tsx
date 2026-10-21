import { useEffect, useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import type { ItineraryItem, PlaceType, TravelData } from '../models/travel'
import { travelRepository } from '../repositories/travelRepository'
import { tripDays } from '../utils/selectors'
import { displayDate } from '../utils/date'

const categories: { value: PlaceType; label: string }[] = [
  { value: 'sight', label: '景点' }, { value: 'food', label: '咖啡 / 餐厅' },
  { value: 'transport', label: '交通' }, { value: 'stay', label: '住宿' },
  { value: 'shop', label: '购物' }, { value: 'photo', label: '拍照点' }, { value: 'other', label: '其他' },
]

export function PlaceSheet({ data, tripId, dayId, item, onClose }: { data: TravelData; tripId: string; dayId: string; item?: ItineraryItem; onClose: () => void }) {
  const place = data.places.find(entry => entry.id === item?.placeId)
  const [type, setType] = useState<PlaceType>(place?.type ?? 'sight')
  const [name, setName] = useState(place?.name ?? '')
  const [time, setTime] = useState(item?.time ?? '')
  const [duration, setDuration] = useState(item?.durationMinutes?.toString() ?? '')
  const [budget, setBudget] = useState(item?.budget?.toString() ?? '')
  const [note, setNote] = useState(item?.note ?? '')
  const [latitude, setLatitude] = useState(place?.latitude?.toString() ?? '')
  const [longitude, setLongitude] = useState(place?.longitude?.toString() ?? '')
  const [selectedDayId, setSelectedDayId] = useState(dayId)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const days = tripDays(data, tripId)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function save(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) { setError('请填写地点名称'); return }
    try {
      travelRepository.upsertItem({
        id: item?.id, dayId: selectedDayId, name: name.trim(), type, time,
        durationMinutes: duration ? Number(duration) : undefined,
        budget: budget ? Number(budget) : undefined,
        note, latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      })
      onClose()
    } catch (cause) { setError(cause instanceof Error ? cause.message : '保存失败') }
  }

  return <div className="sheet-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="place-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="sheet-grip" />
      <div className="sheet-heading"><div><span className="overline">PLACE / {item ? 'EDIT' : 'NEW'}</span><h2 id="sheet-title">{item ? '修改地点' : '添加地点'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><X size={22} /></button></div>
      <form onSubmit={save}>
        <fieldset className="category-picker"><legend>类型</legend>{categories.map(category => <button key={category.value} type="button" className={type === category.value ? 'selected' : ''} onClick={() => setType(category.value)}>{category.label}</button>)}</fieldset>
        <label className="field">地点名称<input value={name} onChange={event => { setName(event.target.value); setError('') }} placeholder="例如：小麦岛" autoFocus /></label>
        <div className="field-row"><label className="field">时间<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label><label className="field">预计停留 / 分钟<input type="number" min="0" inputMode="numeric" value={duration} onChange={event => setDuration(event.target.value)} placeholder="120" /></label></div>
        <div className="field-row"><label className="field">预算 / ¥<input type="number" min="0" step="0.01" inputMode="decimal" value={budget} onChange={event => setBudget(event.target.value)} placeholder="可选" /></label><label className="field">所属日期<select value={selectedDayId} onChange={event => setSelectedDayId(event.target.value)}>{days.map((day, index) => <option key={day.id} value={day.id}>Day {index + 1} · {displayDate(day.date)}</option>)}</select></label></div>
        <label className="field">备注<textarea rows={2} value={note} onChange={event => setNote(event.target.value)} placeholder="这里适合浪费一点时间。" /></label>
        <details className="coordinates"><summary>地图位置（可选）</summary><div className="field-row"><label className="field">纬度<input type="number" step="any" inputMode="decimal" value={latitude} onChange={event => setLatitude(event.target.value)} placeholder="36.0477" /></label><label className="field">经度<input type="number" step="any" inputMode="decimal" value={longitude} onChange={event => setLongitude(event.target.value)} placeholder="120.4311" /></label></div></details>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="sheet-actions">{item && <button className="delete-button" type="button" onClick={() => confirmDelete ? (travelRepository.deleteItem(item.id), onClose()) : setConfirmDelete(true)}><Trash2 size={16} />{confirmDelete ? '确定删除' : '删除'}</button>}<button className="primary-button" type="submit"><Check size={18} /> 保存地点</button></div>
      </form>
    </section>
  </div>
}
