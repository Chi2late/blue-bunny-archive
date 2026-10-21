import { useEffect, useMemo, useRef, useState } from 'react'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import type { City } from '../../models/travel'
import { normalizeCityName } from '../../data/cities'

type Position = [number, number]
type Polygon = Position[][]
type MultiPolygon = Position[][][]

interface MapFeature {
  type: 'Feature'
  properties: { adcode?: number; name: string; level?: string; parentAdcode?: number; center?: Position }
  geometry: { type: 'Polygon'; coordinates: Polygon } | { type: 'MultiPolygon'; coordinates: MultiPolygon }
}

interface MapData {
  metadata: { source: string; sourceName: string }
  provinces: MapFeature[]
  areas: MapFeature[]
}

export interface ResolvedCity {
  city: City
  feature?: MapFeature
  provinceName?: string
}

const WIDTH = 720
const HEIGHT = 500
const MIN_LON = 73
const MAX_LON = 135
const MIN_LAT = 18
const MAX_LAT = 54

function project([longitude, latitude]: Position): Position {
  return [((longitude - MIN_LON) / (MAX_LON - MIN_LON)) * WIDTH, ((MAX_LAT - latitude) / (MAX_LAT - MIN_LAT)) * HEIGHT]
}

function ringPath(ring: Position[]) {
  return ring.map((point, index) => { const [x, y] = project(point); return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}` }).join(' ') + ' Z'
}

function featurePath(feature: MapFeature) {
  if (!feature.geometry) return ''
  if (feature.geometry.type === 'Polygon') return feature.geometry.coordinates.map(ringPath).join(' ')
  return feature.geometry.coordinates.flatMap(polygon => polygon.map(ringPath)).join(' ')
}

function findFeature(city: City, data: MapData) {
  const all = [...data.areas, ...data.provinces]
  if (city.adcode) {
    const byCode = all.find(feature => feature.properties.adcode === city.adcode)
    if (byCode) return byCode
  }
  return all.find(feature => normalizeCityName(feature.properties.name) === city.normalizedName)
}

function findProvinceName(feature: MapFeature | undefined, data: MapData) {
  if (!feature) return undefined
  const province = data.provinces.find(entry => entry.properties.adcode === feature.properties.adcode)
  if (province) return normalizeCityName(province.properties.name)
  let parent = feature.properties.parentAdcode
  for (let depth = 0; depth < 3 && parent; depth += 1) {
    const directProvince = data.provinces.find(entry => entry.properties.adcode === parent)
    if (directProvince) return normalizeCityName(directProvince.properties.name)
    const parentArea = data.areas.find(entry => entry.properties.adcode === parent)
    parent = parentArea?.properties.parentAdcode
  }
  return undefined
}

function clampTransform(next: { x: number; y: number; scale: number }) {
  const margin = 90
  return {
    scale: Math.min(4, Math.max(1, next.scale)),
    x: Math.min(margin, Math.max(WIDTH * (1 - next.scale) - margin, next.x)),
    y: Math.min(margin, Math.max(HEIGHT * (1 - next.scale) - margin, next.y)),
  }
}

export function FootprintMap({ cities, selectedCityId, onSelect, onResolved }: { cities: City[]; selectedCityId?: string; onSelect: (cityId: string) => void; onResolved?: (entries: ResolvedCity[]) => void }) {
  const [data, setData] = useState<MapData | null>(null)
  const [error, setError] = useState(false)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const pointers = useRef(new Map<number, Position>())
  const gesture = useRef<{ transform: typeof transform; midpoint: Position; distance: number } | null>(null)
  const moved = useRef(false)
  const pressedCityId = useRef<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}maps/china-administrative.json`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('map'); return response.json() as Promise<MapData> })
      .then(setData)
      .catch(cause => { if ((cause as Error).name !== 'AbortError') setError(true) })
    return () => controller.abort()
  }, [])

  const resolved = useMemo<ResolvedCity[]>(() => data ? cities.map(city => {
    const feature = findFeature(city, data)
    return { city, feature, provinceName: findProvinceName(feature, data) }
  }) : [], [cities, data])

  useEffect(() => { if (data) onResolved?.(resolved) }, [data, onResolved, resolved])

  function resetGesture() {
    const points = [...pointers.current.values()]
    if (points.length === 0) { gesture.current = null; return }
    const midpoint: Position = points.length === 1 ? points[0] : [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2]
    const distance = points.length === 1 ? 1 : Math.hypot(points[0][0] - points[1][0], points[0][1] - points[1][1])
    gesture.current = { transform, midpoint, distance }
  }

  function pointerPoint(event: React.PointerEvent<SVGSVGElement>): Position {
    const rect = event.currentTarget.getBoundingClientRect()
    return [(event.clientX - rect.left) * WIDTH / rect.width, (event.clientY - rect.top) * HEIGHT / rect.height]
  }

  function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, pointerPoint(event))
    moved.current = false
    pressedCityId.current = (event.target as Element).closest('[data-city-id]')?.getAttribute('data-city-id') ?? null
    resetGesture()
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return
    pointers.current.set(event.pointerId, pointerPoint(event))
    const points = [...pointers.current.values()]
    const midpoint: Position = points.length === 1 ? points[0] : [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2]
    const start = gesture.current
    if (Math.hypot(midpoint[0] - start.midpoint[0], midpoint[1] - start.midpoint[1]) > 8 || points.length > 1) moved.current = true
    if (points.length === 1) {
      setTransform(clampTransform({ ...start.transform, x: start.transform.x + midpoint[0] - start.midpoint[0], y: start.transform.y + midpoint[1] - start.midpoint[1] }))
      return
    }
    const distance = Math.max(1, Math.hypot(points[0][0] - points[1][0], points[0][1] - points[1][1]))
    const scale = Math.min(4, Math.max(1, start.transform.scale * distance / start.distance))
    const ratio = scale / start.transform.scale
    setTransform(clampTransform({ scale, x: midpoint[0] - (start.midpoint[0] - start.transform.x) * ratio, y: midpoint[1] - (start.midpoint[1] - start.transform.y) * ratio }))
  }

  function onPointerUp(event: React.PointerEvent<SVGSVGElement>) {
    const shouldSelect = pointers.current.size === 1 && !moved.current ? pressedCityId.current : null
    pointers.current.delete(event.pointerId)
    resetGesture()
    if (shouldSelect) onSelect(shouldSelect)
    if (pointers.current.size === 0) pressedCityId.current = null
  }

  function zoom(multiplier: number) {
    setTransform(current => {
      const scale = Math.min(4, Math.max(1, current.scale * multiplier))
      const ratio = scale / current.scale
      return clampTransform({ scale, x: WIDTH / 2 - (WIDTH / 2 - current.x) * ratio, y: HEIGHT / 2 - (HEIGHT / 2 - current.y) * ratio })
    })
  }

  if (error) return <div className="footprint-map-state"><strong>地图暂时没加载出来。</strong><span>旅行记录还在，稍后再试。</span></div>
  if (!data) return <div className="footprint-map-state loading"><span>MAP / LOADING</span><i /></div>

  return <div className="footprint-map-frame">
    <svg className="footprint-map" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-label="中国城市足迹地图" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={event => { event.preventDefault(); zoom(event.deltaY > 0 ? .88 : 1.12) }}>
      <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
        {data.areas.map(feature => <path key={`area-${feature.properties.adcode}`} d={featurePath(feature)} className="footprint-area" fillRule="evenodd" />)}
        {data.provinces.map(feature => <path key={`province-${feature.properties.adcode}`} d={featurePath(feature)} className="footprint-province" fillRule="evenodd" />)}
        {resolved.filter(entry => entry.feature).map(entry => <path key={`visited-${entry.city.id}`} data-city-id={entry.city.id} d={featurePath(entry.feature!)} className={`footprint-visited ${selectedCityId === entry.city.id ? 'selected' : ''}`} fillRule="evenodd" role="button" tabIndex={0} aria-label={`打开${entry.city.name}城市档案`} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onSelect(entry.city.id) }} />)}
      </g>
    </svg>
    <div className="map-controls" aria-label="地图缩放"><button type="button" onClick={() => zoom(1.28)} aria-label="放大地图"><Plus size={17} /></button><button type="button" onClick={() => zoom(.78)} aria-label="缩小地图"><Minus size={17} /></button><button type="button" onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} aria-label="复位地图"><LocateFixed size={17} /></button></div>
    <span className="map-gesture-tip">双指缩放 · 拖动查看</span>
  </div>
}
