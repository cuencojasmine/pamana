import type { StrapiEntity } from './index'

export type CooperativeStatus = 'active' | 'inactive'
export type RouteStatus = 'active' | 'inactive'
export type DriverStatus = 'active' | 'inactive'
export type VehicleStatus = 'available' | 'in_transit' | 'full' | 'offline'
export type StopType = 'pickup' | 'dropoff' | 'both' | 'terminal'

export interface Cooperative extends StrapiEntity {
  name: string
  address?: string
  contact_number?: string
  contact_person?: string
  cooperative_status: CooperativeStatus
}

export interface Route extends StrapiEntity {
  route_name: string
  route_code: string
  origin: string
  destination: string
  base_fare?: number
  estimated_travel_time?: number
  route_status: RouteStatus
}

export interface RouteStop extends StrapiEntity {
  name: string
  sequence: number
  latitude: number
  longitude: number
  stop_type?: StopType
  route?: Route | null
}

export interface Driver extends StrapiEntity {
  driver_number: string
  first_name: string
  last_name: string
  contact_number?: string
  license_number?: string
  driver_status: DriverStatus
  cooperative?: Cooperative | null
  vehicle?: Vehicle | null
}

export interface Vehicle extends StrapiEntity {
  vehicle_number: string
  plate_number: string
  vehicle_type: string
  capacity?: number
  current_occupancy: number
  vehicle_status: VehicleStatus
  route?: Route | null
  cooperative?: Cooperative | null
  driver?: Driver | null
}
