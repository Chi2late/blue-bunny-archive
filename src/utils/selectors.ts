import type { TravelData } from '../models/travel'

export function tripDays(data: TravelData, tripId: string) {
  return data.days.filter(day => day.tripId === tripId).sort((a, b) => a.order - b.order)
}

export function dayItems(data: TravelData, dayId: string) {
  return data.items.filter(item => item.dayId === dayId).sort((a, b) => a.order - b.order)
}

export function placeFor(data: TravelData, placeId: string) {
  return data.places.find(place => place.id === placeId)
}
