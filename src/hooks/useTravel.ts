import { useSyncExternalStore } from 'react'
import { travelRepository } from '../repositories/travelRepository'

export function useTravel() {
  return useSyncExternalStore(travelRepository.subscribe, travelRepository.getSnapshot)
}
