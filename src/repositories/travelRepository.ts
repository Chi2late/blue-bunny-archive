import { createCity } from '../data/cities'
import type { CheckIn, City, ItemInput, ItineraryItem, Place, TravelData, Trip, TripDay } from '../models/travel'
import { addDays, toISO } from '../utils/date'

export interface TravelRepository {
  getSnapshot(): TravelData
  subscribe(listener: () => void): () => void
  createTrip(input: Pick<Trip, 'city' | 'title' | 'startDate' | 'endDate' | 'companions' | 'coverUrl'>): Trip
  addDay(tripId: string, date: string): TripDay
  upsertItem(input: ItemInput): ItineraryItem
  deleteItem(itemId: string): void
  reorderItems(dayId: string, ids: string[]): void
  checkIn(itemId: string): CheckIn
  updateCheckInNote(checkInId: string, note: string): void
}

const storageKey = 'blue-bunny-archive-v1'

interface TravelDataV1 {
  version: 1
  trips: Omit<Trip, 'cityId'>[]
  days: TripDay[]
  places: Omit<Place, 'cityId'>[]
  items: ItineraryItem[]
}

function seedData(): TravelData {
  const today = toISO(new Date())
  const start = addDays(today, 26)
  const second = addDays(start, 1)
  const tripId = 'demo-qingdao'
  const day1 = 'demo-day-1'
  const day2 = 'demo-day-2'
  const city = createCity('青岛')
  const places: Place[] = [
    { id: 'demo-zhanqiao', cityId: city.id, city: '青岛', name: '栈桥', type: 'sight', latitude: 36.0583, longitude: 120.3175 },
    { id: 'demo-daxuelu', cityId: city.id, city: '青岛', name: '大学路', type: 'photo', latitude: 36.0658, longitude: 120.3311 },
    { id: 'demo-badaguan', cityId: city.id, city: '青岛', name: '八大关', type: 'sight', latitude: 36.0516, longitude: 120.3522 },
    { id: 'demo-xiaomaidao', cityId: city.id, city: '青岛', name: '小麦岛', type: 'photo', latitude: 36.0477, longitude: 120.4311 },
  ]
  return {
    version: 2,
    trips: [{ id: tripId, cityId: city.id, city: '青岛', title: '青岛五日游', startDate: start, endDate: addDays(start, 4), companions: ['我'], coverUrl: './qingdao-pier.jpg', createdAt: new Date().toISOString() }],
    days: [{ id: day1, tripId, date: start, order: 0 }, { id: day2, tripId, date: second, order: 1 }],
    places,
    items: [
      { id: 'demo-item-1', dayId: day1, placeId: 'demo-zhanqiao', time: '09:30', durationMinutes: 90, note: '先去海边吹吹风', order: 0 },
      { id: 'demo-item-2', dayId: day1, placeId: 'demo-daxuelu', time: '11:30', durationMinutes: 60, note: '街角适合拍照', order: 1 },
      { id: 'demo-item-3', dayId: day2, placeId: 'demo-badaguan', time: '10:00', durationMinutes: 120, note: '', order: 0 },
      { id: 'demo-item-4', dayId: day2, placeId: 'demo-xiaomaidao', time: '15:30', durationMinutes: 120, note: '等日落', order: 1 },
    ],
    cities: [city],
    checkIns: [],
  }
}

function migrateV1(data: TravelDataV1): TravelData {
  const cities: City[] = []
  const cityFor = (name: string) => {
    const candidate = createCity(name)
    const existing = cities.find(city => city.id === candidate.id)
    if (existing) return existing
    cities.push(candidate)
    return candidate
  }
  const trips: Trip[] = data.trips.map(trip => ({ ...trip, cityId: cityFor(trip.city).id }))
  const places: Place[] = data.places.map(place => ({ ...place, cityId: cityFor(place.city).id }))
  return { version: 2, trips, days: data.days, places, items: data.items, cities, checkIns: [] }
}

function readData(): TravelData {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as TravelData | TravelDataV1
      if (parsed.version === 2 && Array.isArray(parsed.trips) && Array.isArray(parsed.days) && Array.isArray(parsed.places) && Array.isArray(parsed.items) && Array.isArray(parsed.cities) && Array.isArray(parsed.checkIns)) return parsed
      if (parsed.version === 1 && Array.isArray(parsed.trips) && Array.isArray(parsed.days) && Array.isArray(parsed.places) && Array.isArray(parsed.items)) {
        const migrated = migrateV1(parsed)
        window.localStorage.setItem(storageKey, JSON.stringify(migrated))
        return migrated
      }
    }
  } catch {
    // Corrupt or unavailable storage falls back to the sample itinerary.
  }
  return seedData()
}

class LocalTravelRepository implements TravelRepository {
  private data = readData()
  private listeners = new Set<() => void>()

  getSnapshot = () => this.data
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  private commit(data: TravelData) {
    this.data = data
    try { window.localStorage.setItem(storageKey, JSON.stringify(data)) } catch { /* UI remains usable this session. */ }
    this.listeners.forEach(listener => listener())
  }
  createTrip(input: Pick<Trip, 'city' | 'title' | 'startDate' | 'endDate' | 'companions' | 'coverUrl'>) {
    const candidate = createCity(input.city)
    const city = this.data.cities.find(entry => entry.id === candidate.id) ?? candidate
    const trip: Trip = { ...input, cityId: city.id, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    this.commit({ ...this.data, trips: [trip, ...this.data.trips], cities: this.data.cities.some(entry => entry.id === city.id) ? this.data.cities : [...this.data.cities, city] })
    return trip
  }
  addDay(tripId: string, date: string) {
    const days = this.data.days.filter(day => day.tripId === tripId)
    const existing = days.find(day => day.date === date)
    if (existing) return existing
    const day: TripDay = { id: crypto.randomUUID(), tripId, date, order: days.length }
    this.commit({ ...this.data, days: [...this.data.days, day] })
    return day
  }
  upsertItem(input: ItemInput) {
    const day = this.data.days.find(entry => entry.id === input.dayId)
    const trip = this.data.trips.find(entry => entry.id === day?.tripId)
    if (!day || !trip) throw new Error('找不到所属旅程')
    const normalizedName = input.name.trim().toLocaleLowerCase()
    const existingPlace = this.data.places.find(place => place.city === trip.city && place.name.trim().toLocaleLowerCase() === normalizedName)
    const place: Place = existingPlace ?? { id: crypto.randomUUID(), cityId: trip.cityId, city: trip.city, name: input.name.trim(), type: input.type, latitude: input.latitude, longitude: input.longitude }
    const places = existingPlace
      ? this.data.places.map(entry => entry.id === place.id ? { ...entry, type: input.type, latitude: input.latitude ?? entry.latitude, longitude: input.longitude ?? entry.longitude } : entry)
      : [...this.data.places, place]
    const oldItem = input.id ? this.data.items.find(entry => entry.id === input.id) : undefined
    const dayItems = this.data.items.filter(entry => entry.dayId === input.dayId)
    const item: ItineraryItem = {
      id: oldItem?.id ?? crypto.randomUUID(), dayId: input.dayId, placeId: place.id,
      time: input.time, durationMinutes: input.durationMinutes, budget: input.budget,
      note: input.note.trim(), order: oldItem?.dayId === input.dayId ? oldItem.order : dayItems.length,
    }
    const items = oldItem ? this.data.items.map(entry => entry.id === oldItem.id ? item : entry) : [...this.data.items, item]
    this.commit({ ...this.data, places, items })
    return item
  }
  deleteItem(itemId: string) {
    this.commit({ ...this.data, items: this.data.items.filter(item => item.id !== itemId) })
  }
  reorderItems(dayId: string, ids: string[]) {
    const order = new Map(ids.map((id, index) => [id, index]))
    this.commit({ ...this.data, items: this.data.items.map(item => item.dayId === dayId && order.has(item.id) ? { ...item, order: order.get(item.id)! } : item) })
  }
  checkIn(itemId: string) {
    const existing = this.data.checkIns.find(entry => entry.itineraryItemId === itemId)
    if (existing) return existing
    const item = this.data.items.find(entry => entry.id === itemId)
    const day = this.data.days.find(entry => entry.id === item?.dayId)
    const trip = this.data.trips.find(entry => entry.id === day?.tripId)
    const place = this.data.places.find(entry => entry.id === item?.placeId)
    if (!item || !day || !trip || !place) throw new Error('找不到要打卡的地点')
    const checkIn: CheckIn = {
      id: crypto.randomUUID(), itineraryItemId: item.id, tripId: trip.id, dayId: day.id,
      placeId: place.id, cityId: place.cityId, checkedAt: new Date().toISOString(), note: '',
    }
    this.commit({ ...this.data, checkIns: [...this.data.checkIns, checkIn] })
    return checkIn
  }
  updateCheckInNote(checkInId: string, note: string) {
    this.commit({ ...this.data, checkIns: this.data.checkIns.map(entry => entry.id === checkInId ? { ...entry, note: note.trim() } : entry) })
  }
}

export const travelRepository: TravelRepository = new LocalTravelRepository()
