export type PlaceType = 'sight' | 'food' | 'transport' | 'stay' | 'shop' | 'photo' | 'other'

export interface Trip {
  id: string
  cityId: string
  city: string
  title: string
  startDate: string
  endDate: string
  companions: string[]
  coverUrl?: string
  createdAt: string
}

export interface TripDay {
  id: string
  tripId: string
  date: string
  order: number
}

export interface Place {
  id: string
  cityId: string
  city: string
  name: string
  type: PlaceType
  latitude?: number
  longitude?: number
}

export interface ItineraryItem {
  id: string
  dayId: string
  placeId: string
  time: string
  durationMinutes?: number
  budget?: number
  note: string
  order: number
}

export interface City {
  id: string
  name: string
  normalizedName: string
  englishName?: string
  province?: string
  adcode?: number
}

export interface CheckIn {
  id: string
  itineraryItemId?: string
  tripId: string
  dayId: string
  placeId: string
  cityId: string
  checkedAt: string
  note: string
}

export interface TravelData {
  version: 2
  trips: Trip[]
  days: TripDay[]
  places: Place[]
  items: ItineraryItem[]
  cities: City[]
  checkIns: CheckIn[]
}

export interface ItemInput {
  id?: string
  dayId: string
  name: string
  type: PlaceType
  time: string
  durationMinutes?: number
  budget?: number
  note: string
  latitude?: number
  longitude?: number
}
