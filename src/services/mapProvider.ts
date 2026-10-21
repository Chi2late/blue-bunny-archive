import type { ItineraryItem, Place } from '../models/travel'

export interface MapPoint {
  id: string
  name: string
  x: number
  y: number
}

export interface MapProvider {
  getPoints(items: ItineraryItem[], places: Place[]): MapPoint[]
  navigationUrl(place: Place): string
}

export const schematicMapProvider: MapProvider = {
  getPoints(items, places) {
    const ordered = [...items].sort((a, b) => a.order - b.order)
    const resolved = ordered.map(item => places.find(place => place.id === item.placeId)).filter((place): place is Place => !!place)
    const coordinates = resolved.filter(place => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
    const hasGeography = coordinates.length === resolved.length && coordinates.length > 1
    const lats = coordinates.map(place => place.latitude!)
    const lngs = coordinates.map(place => place.longitude!)
    const minLat = Math.min(...lats), maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
    return resolved.map((place, index) => ({
      id: ordered[index].id,
      name: place.name,
      x: hasGeography ? 15 + ((place.longitude! - minLng) / (maxLng - minLng || 1)) * 70 : 20 + ((index * 31) % 60),
      y: hasGeography ? 18 + (1 - (place.latitude! - minLat) / (maxLat - minLat || 1)) * 64 : 25 + ((index * 37) % 52),
    }))
  },
  navigationUrl(place) {
    return `https://uri.amap.com/search?keyword=${encodeURIComponent(`${place.city}${place.name}`)}`
  },
}
