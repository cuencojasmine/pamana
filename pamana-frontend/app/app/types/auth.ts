export type PamanaRole =
  | 'Passenger'
  | 'Driver'
  | 'LGU'
  | 'Administrator'

export interface AuthRole {
  id: number
  name: PamanaRole | string
  type?: string
}

export interface AuthUser {
  id: number
  documentId?: string
  username: string
  email: string
  confirmed?: boolean
  blocked?: boolean
  role?: AuthRole
}

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface LoginResponse {
  jwt: string
  user: AuthUser
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  contactNumber?: string
}

export interface PassengerProfile {
  id: number
  documentId: string
  first_name: string
  last_name: string
  contact_number?: string
}