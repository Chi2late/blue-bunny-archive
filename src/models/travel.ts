export type PlaceType = 'sight' | 'food' | 'transport' | 'stay' | 'shop' | 'photo' | 'other'

export interface Trip {
  id: string
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

export interface TravelData {
  version: 1
  trips: Trip[]
  days: TripDay[]
  places: Place[]
  items: ItineraryItem[]
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
